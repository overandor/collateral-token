#!/usr/bin/env python3
"""
Reviewed Evidence Verifier

This script combines a Merkle report with an explicit appraisal JSON file.
It does not invent values. If appraisal data is missing, valuation is zero
and the proof is marked incomplete.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any


class CollateralVerifier:
    """Verifies evidence integrity and calculates reviewed valuation."""

    def __init__(self, merkle_report_path: str, appraisal_report_path: str):
        self.merkle_report_path = Path(merkle_report_path)
        self.appraisal_report_path = Path(appraisal_report_path)
        self.merkle_data = self._load_json(self.merkle_report_path, required=True)
        self.appraisal_data = self._load_appraisal_data()

    @staticmethod
    def _load_json(path: Path, required: bool = False) -> Dict[str, Any]:
        if not path.exists():
            if required:
                raise FileNotFoundError(f"required file not found: {path}")
            return {}
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _load_appraisal_data(self) -> Dict[str, Any]:
        """Load explicit appraisal JSON.

        Expected shape:
        {
          "reviewer": "name or key id",
          "reviewed_at": "ISO-8601 timestamp",
          "assets": {
            "repo-name": {
              "min": 1000,
              "max": 3000,
              "mid": 2000,
              "confidence": 0.65,
              "reason": "short explanation"
            }
          }
        }
        """
        data = self._load_json(self.appraisal_report_path, required=False)
        if "assets" in data and isinstance(data["assets"], dict):
            return data["assets"]
        if data:
            # Backward-compatible shape: repo -> valuation object.
            return data
        return {}

    def verify_repo_integrity(self, repo_name: str, expected_root: str) -> bool:
        """Verify repository integrity against an externally supplied expected root."""
        if repo_name not in self.merkle_data:
            return False
        actual_root = self.merkle_data[repo_name].get("merkle_root", "")
        return bool(expected_root) and actual_root == expected_root

    def verify_all_repos(self) -> Dict[str, bool]:
        """Verify all appraised repositories against Merkle report entries."""
        results: Dict[str, bool] = {}
        for repo_name, appraisal in self.appraisal_data.items():
            expected_root = appraisal.get("merkle_root") or self.merkle_data.get(repo_name, {}).get("expected_merkle_root")
            results[repo_name] = self.verify_repo_integrity(repo_name, expected_root or "")
        return results

    def calculate_total_reviewed_value_cents(self, valuation_type: str = "mid") -> int:
        """Calculate total reviewed value in USD cents from explicit appraisal input."""
        total_usd = 0.0
        for appraisal in self.appraisal_data.values():
            value = appraisal.get(valuation_type)
            if isinstance(value, (int, float)) and value > 0:
                total_usd += float(value)
        return int(round(total_usd * 100))

    def get_collateral_breakdown(self) -> Dict[str, Any]:
        """Get detailed reviewed evidence breakdown."""
        breakdown: Dict[str, Any] = {}
        verification = self.verify_all_repos()
        for repo_name, appraisal in self.appraisal_data.items():
            repo_data = self.merkle_data.get(repo_name, {})
            breakdown[repo_name] = {
                "reviewed_value_usd": appraisal.get("mid", 0),
                "confidence": appraisal.get("confidence", 0),
                "reason": appraisal.get("reason", ""),
                "merkle_root": repo_data.get("merkle_root", ""),
                "expected_merkle_root": appraisal.get("merkle_root", ""),
                "total_files": repo_data.get("total_files", repo_data.get("file_count", 0)),
                "verified": verification.get(repo_name, False),
            }
        return breakdown

    def get_overall_merkle_root(self) -> str:
        """Get overall Merkle root for all repositories if available."""
        summary_path = self.merkle_report_path.parent / "MERKLE_SUMMARY.json"
        if summary_path.exists():
            with open(summary_path, "r", encoding="utf-8") as f:
                summary = json.load(f)
                return summary.get("overall_merkle_root", "")
        return ""

    def packet_hash(self) -> str:
        payload = {
            "merkle_report": self.merkle_data,
            "appraisal_assets": self.appraisal_data,
        }
        encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
        return hashlib.sha256(encoded).hexdigest()

    def generate_evidence_proof(self) -> Dict[str, Any]:
        """Generate reviewed evidence proof for downstream on-chain reference."""
        verification_results = self.verify_all_repos()
        all_verified = bool(verification_results) and all(verification_results.values())
        appraisal_present = bool(self.appraisal_data)

        return {
            "schema": "reviewed-evidence-proof-v1",
            "packet_hash": self.packet_hash(),
            "overall_merkle_root": self.get_overall_merkle_root(),
            "reviewed_value_usd": self.calculate_total_reviewed_value_cents("mid") / 100,
            "reviewed_value_cents": self.calculate_total_reviewed_value_cents("mid"),
            "appraisal_present": appraisal_present,
            "all_repos_verified": all_verified,
            "verification_results": verification_results,
            "breakdown": self.get_collateral_breakdown(),
            "truth_label": "reviewed_value_only_not_market_guarantee",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

    def export_for_chain(self, output_path: str):
        """Export reviewed evidence proof for downstream on-chain reference."""
        proof = self.generate_evidence_proof()
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(proof, f, indent=2, sort_keys=True)
        print(f"Evidence proof exported to: {output_path}")


class EvidenceMonitor:
    """Monitor reviewed evidence ratio against token supply."""

    def __init__(self, verifier: CollateralVerifier):
        self.verifier = verifier
        self.alert_thresholds = {
            "warning": 105.0,
            "critical": 100.0,
            "emergency": 95.0,
        }

    @staticmethod
    def calculate_ratio(reviewed_value_cents: int, token_supply_atoms: int, token_decimals: int = 6) -> float:
        reviewed_value_usd = reviewed_value_cents / 100
        token_supply_units = token_supply_atoms / (10 ** token_decimals)
        if token_supply_units == 0:
            return float("inf")
        return (reviewed_value_usd / token_supply_units) * 100

    def check_health(self, token_supply_atoms: int) -> Dict[str, Any]:
        reviewed_value_cents = self.verifier.calculate_total_reviewed_value_cents("mid")
        ratio = self.calculate_ratio(reviewed_value_cents, token_supply_atoms)

        status = "healthy"
        if ratio <= self.alert_thresholds["emergency"]:
            status = "emergency"
        elif ratio <= self.alert_thresholds["critical"]:
            status = "critical"
        elif ratio <= self.alert_thresholds["warning"]:
            status = "warning"

        return {
            "ratio_percent": ratio,
            "status": status,
            "reviewed_value_usd": reviewed_value_cents / 100,
            "token_supply_atoms": token_supply_atoms,
            "truth_label": "ratio_based_on_reviewed_evidence_not_market_liquidity",
        }


def main():
    parser = argparse.ArgumentParser(description="Generate reviewed evidence proof")
    parser.add_argument("--merkle-report", required=True, help="Path to MERKLE_TREES_REPORT.json")
    parser.add_argument("--appraisal-json", required=True, help="Path to explicit appraisal JSON")
    parser.add_argument("--output", default="evidence_proof.json", help="Output JSON path")
    parser.add_argument("--supply-atoms", type=int, default=0, help="Optional token supply atoms for health check")
    args = parser.parse_args()

    verifier = CollateralVerifier(args.merkle_report, args.appraisal_json)
    proof = verifier.generate_evidence_proof()
    verifier.export_for_chain(args.output)

    print("Reviewed evidence proof")
    print(f"  Packet hash: {proof['packet_hash']}")
    print(f"  Reviewed value: ${proof['reviewed_value_usd']:,.2f}")
    print(f"  Appraisal present: {proof['appraisal_present']}")
    print(f"  All repos verified: {proof['all_repos_verified']}")

    monitor = EvidenceMonitor(verifier)
    health = monitor.check_health(args.supply_atoms)
    print(f"  Ratio: {health['ratio_percent']}")
    print(f"  Status: {health['status']}")


if __name__ == "__main__":
    main()
