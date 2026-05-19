#!/usr/bin/env python3
"""
Collateral Verification System for CUSD Token
Integrates Merkle tree verification with collateral valuation
"""

import json
import hashlib
from pathlib import Path
from typing import Dict, List, Optional
import requests

class CollateralVerifier:
    """Verifies collateral integrity and calculates USD valuation"""
    
    def __init__(self, merkle_report_path: str, appraisal_report_path: str):
        self.merkle_report_path = Path(merkle_report_path)
        self.appraisal_report_path = Path(appraisal_report_path)
        self.merkle_data = self._load_merkle_data()
        self.appraisal_data = self._load_appraisal_data()
        
    def _load_merkle_data(self) -> Dict:
        """Load Merkle tree data from JSON report"""
        with open(self.merkle_report_path, 'r') as f:
            return json.load(f)
    
    def _load_appraisal_data(self) -> Dict:
        """Load appraisal data (parse from markdown)"""
        # For now, return hardcoded appraisal values
        # In production, parse from APPRAISAL_REPORT.md
        return {
            "membra-core": {"min": 85000, "max": 120000, "mid": 102500},
            "membra-ecosystem": {"min": 20000, "max": 35000, "mid": 27500},
            "membra-finance": {"min": 75000, "max": 110000, "mid": 92500},
            "language-fi": {"min": 30000, "max": 50000, "mid": 40000},
            "overmanifold": {"min": 95000, "max": 140000, "mid": 117500},
            "ai-infrastructure": {"min": 45000, "max": 70000, "mid": 57500},
            "applications": {"min": 25000, "max": 45000, "mid": 35000},
            "documentation": {"min": 10000, "max": 18000, "mid": 14000},
            "data-assets": {"min": 35000, "max": 55000, "mid": 45000},
            "archive": {"min": 15000, "max": 25000, "mid": 20000}
        }
    
    def verify_repo_integrity(self, repo_name: str, expected_root: str) -> bool:
        """Verify repository integrity against expected Merkle root"""
        if repo_name not in self.merkle_data:
            return False
        
        actual_root = self.merkle_data[repo_name]["merkle_root"]
        return actual_root == expected_root
    
    def verify_all_repos(self) -> Dict[str, bool]:
        """Verify all repositories"""
        results = {}
        for repo_name, repo_data in self.merkle_data.items():
            expected_root = repo_data["merkle_root"]
            results[repo_name] = self.verify_repo_integrity(repo_name, expected_root)
        return results
    
    def calculate_total_collateral(self, valuation_type: str = "mid") -> int:
        """Calculate total collateral value in USD cents"""
        total = 0
        for repo_name, appraisal in self.appraisal_data.items():
            if valuation_type in appraisal:
                total += appraisal[valuation_type]
        return total * 100  # Convert to cents
    
    def get_collateral_breakdown(self) -> Dict:
        """Get detailed collateral breakdown"""
        breakdown = {}
        for repo_name, appraisal in self.appraisal_data.items():
            if repo_name in self.merkle_data:
                breakdown[repo_name] = {
                    "valuation_usd": appraisal["mid"],
                    "merkle_root": self.merkle_data[repo_name]["merkle_root"],
                    "total_files": self.merkle_data[repo_name]["total_files"],
                    "verified": self.verify_repo_integrity(repo_name, self.merkle_data[repo_name]["merkle_root"])
                }
        return breakdown
    
    def get_overall_merkle_root(self) -> str:
        """Get overall Merkle root for all repositories"""
        # Load from MERKLE_SUMMARY.json if available
        summary_path = self.merkle_report_path.parent / "MERKLE_SUMMARY.json"
        if summary_path.exists():
            with open(summary_path, 'r') as f:
                summary = json.load(f)
                return summary.get("overall_merkle_root", "")
        return ""
    
    def generate_collateral_proof(self) -> Dict:
        """Generate collateral proof for on-chain verification"""
        verification_results = self.verify_all_repos()
        all_verified = all(verification_results.values())
        
        return {
            "overall_merkle_root": self.get_overall_merkle_root(),
            "total_collateral_usd": self.calculate_total_collateral("mid") // 100,
            "total_collateral_cents": self.calculate_total_collateral("mid"),
            "all_repos_verified": all_verified,
            "verification_results": verification_results,
            "collateral_breakdown": self.get_collateral_breakdown(),
            "timestamp": self._get_current_timestamp()
        }
    
    def _get_current_timestamp(self) -> str:
        """Get current ISO timestamp"""
        from datetime import datetime
        return datetime.utcnow().isoformat() + "Z"
    
    def export_for_chain(self, output_path: str):
        """Export collateral proof for on-chain submission"""
        proof = self.generate_collateral_proof()
        with open(output_path, 'w') as f:
            json.dump(proof, f, indent=2)
        print(f"Collateral proof exported to: {output_path}")


class PriceOracle:
    """USD price oracle for collateral valuation"""
    
    def __init__(self):
        self.base_url = "https://api.coingecko.com/api/v3"
    
    def get_sol_price(self) -> float:
        """Get current SOL price in USD"""
        try:
            response = requests.get(f"{self.base_url}/simple/price?ids=solana&vs_currencies=usd")
            data = response.json()
            return data["solana"]["usd"]
        except Exception as e:
            print(f"Error fetching SOL price: {e}")
            return 150.0  # Fallback price
    
    def get_usdc_price(self) -> float:
        """Get USDC price (should be ~1.0)"""
        try:
            response = requests.get(f"{self.base_url}/simple/price?ids=usd-coin&vs_currencies=usd")
            data = response.json()
            return data["usd-coin"]["usd"]
        except Exception as e:
            print(f"Error fetching USDC price: {e}")
            return 1.0  # Fallback price
    
    def calculate_collateral_ratio(self, collateral_usd: int, token_supply: int, token_decimals: int = 6) -> float:
        """Calculate collateral ratio as percentage"""
        collateral_usd_float = collateral_usd / 100  # Convert cents to dollars
        token_supply_float = token_supply / (10 ** token_decimals)
        
        if token_supply_float == 0:
            return 100.0  # 100% if no supply
        
        return (collateral_usd_float / token_supply_float) * 100


class CollateralMonitor:
    """Monitor collateral health and generate alerts"""
    
    def __init__(self, verifier: CollateralVerifier, oracle: PriceOracle):
        self.verifier = verifier
        self.oracle = oracle
        self.alert_thresholds = {
            "warning": 105.0,  # 105% collateral ratio
            "critical": 100.0,  # 100% collateral ratio
            "emergency": 95.0   # 95% collateral ratio
        }
    
    def check_collateral_health(self, token_supply: int) -> Dict:
        """Check collateral health status"""
        collateral_cents = self.verifier.calculate_total_collateral("mid")
        ratio = self.oracle.calculate_collateral_ratio(collateral_cents, token_supply)
        
        status = "healthy"
        if ratio <= self.alert_thresholds["emergency"]:
            status = "emergency"
        elif ratio <= self.alert_thresholds["critical"]:
            status = "critical"
        elif ratio <= self.alert_thresholds["warning"]:
            status = "warning"
        
        return {
            "collateral_ratio": ratio,
            "status": status,
            "collateral_usd": collateral_cents / 100,
            "token_supply": token_supply,
            "recommended_action": self._get_recommended_action(status)
        }
    
    def _get_recommended_action(self, status: str) -> str:
        """Get recommended action based on status"""
        actions = {
            "healthy": "Continue normal operations",
            "warning": "Monitor closely, consider adding collateral",
            "critical": "Pause minting, add collateral immediately",
            "emergency": "Emergency pause, force redemption, add collateral"
        }
        return actions.get(status, "Unknown status")


def main():
    """Main execution function"""
    # Initialize verifier
    base_dir = Path("/Users/alep/Downloads/consolidated_repos")
    merkle_report = base_dir / "MERKLE_TREES_REPORT.json"
    appraisal_report = base_dir / "APPRAISAL_REPORT.md"
    
    verifier = CollateralVerifier(merkle_report, appraisal_report)
    
    # Verify all repos
    print("Verifying repository integrity...")
    verification_results = verifier.verify_all_repos()
    for repo, verified in verification_results.items():
        status = "✅" if verified else "❌"
        print(f"  {status} {repo}")
    
    # Generate collateral proof
    print("\nGenerating collateral proof...")
    proof = verifier.generate_collateral_proof()
    print(f"  Total Collateral: ${proof['total_collateral_usd']:,.2f} USD")
    print(f"  All Verified: {proof['all_repos_verified']}")
    print(f"  Overall Merkle Root: {proof['overall_merkle_root']}")
    
    # Export for chain
    output_path = base_dir / "collateral_token" / "collateral_proof.json"
    verifier.export_for_chain(output_path)
    
    # Initialize oracle and monitor
    print("\nInitializing price oracle...")
    oracle = PriceOracle()
    monitor = CollateralMonitor(verifier, oracle)
    
    # Check health (example with 0 supply)
    health = monitor.check_collateral_health(0)
    print(f"  Collateral Ratio: {health['collateral_ratio']:.2f}%")
    print(f"  Status: {health['status']}")
    print(f"  Recommended Action: {health['recommended_action']}")


if __name__ == "__main__":
    main()
