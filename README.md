# CUSD - Collateral-Backed USD Token

A fully collateralized USD token on Solana, backed by $501,500 in verified digital assets.

## Overview

CUSD is a stablecoin backed by:
- 10 consolidated software repositories
- Cryptographically verified via Merkle trees
- Appraised at $501,500 (mid-range valuation)
- 110% collateral ratio minimum
- On-chain verification of asset integrity

## Token Specifications

- **Name:** Collateral USD
- **Symbol:** CUSD
- **Decimals:** 6 (USDC standard)
- **Chain:** Solana
- **Collateral Ratio:** 110% minimum
- **Backing:** Digital assets (software repositories)
- **Verification:** Merkle tree cryptography

## Architecture

```
CUSD Token (SPL)
    ↓
Collateral Vault (Anchor Program)
    ↓
Asset Registry (Merkle Verified)
    ↓
Price Oracle (USD)
    ↓
Governance (Multi-sig)
```

## Collateral Breakdown

| Repository | Value (USD) | Merkle Root | Status |
|------------|-------------|-------------|---------|
| membra-core | $102,500 | `1b744d...` | ✅ Verified |
| membra-finance | $92,500 | `3d59f1...` | ✅ Verified |
| overmanifold | $117,500 | `e5d005...` | ✅ Verified |
| ai-infrastructure | $57,500 | `5f327e...` | ✅ Verified |
| data-assets | $45,000 | `11d87e...` | ✅ Verified |
| applications | $35,000 | `57e3bb...` | ✅ Verified |
| language-fi | $40,000 | `bed2d5...` | ✅ Verified |
| membra-ecosystem | $27,500 | `6c3fce...` | ✅ Verified |
| archive | $20,000 | `06a7ff...` | ✅ Verified |
| documentation | $14,000 | `5aa198...` | ✅ Verified |

**Total Collateral:** $501,500 USD

## Installation

### Prerequisites
- Rust and Cargo
- Solana CLI
- Anchor Framework
- Python 3.8+

### Install Dependencies
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Install Python dependencies
pip install anchorpy requests
```

## Deployment

### 1. Build the Program
```bash
cd programs/collateral_usd
anchor build
```

### 2. Deploy to Devnet
```bash
anchor deploy --provider.cluster devnet
```

### 3. Initialize the Vault
```bash
python deploy.py
```

### 4. Update Collateral Verification
```bash
python collateral_verifier.py
```

## Usage

### Minting CUSD
```python
from solana.keypair import Keypair
from anchorpy import Program, Provider

# Load program and mint tokens
program = await load_program()
await program.rpc["mint_collateral_usd"](
    amount=1_000_000,  # 1 CUSD (6 decimals)
    # ... accounts
)
```

### Burning CUSD
```python
await program.rpc["burn_collateral_usd"](
    amount=1_000_000,  # 1 CUSD
    # ... accounts
)
```

### Checking Collateral Ratio
```python
from collateral_verifier import CollateralMonitor

monitor = CollateralMonitor(verifier, oracle)
health = monitor.check_collateral_health(token_supply)
print(f"Collateral Ratio: {health['collateral_ratio']:.2f}%")
print(f"Status: {health['status']}")
```

## Verification

### Merkle Tree Verification
```bash
python generate_merkle_trees.py
```

### Collateral Proof Generation
```bash
python collateral_verifier.py
```

### On-Chain Verification
```bash
# Check vault state
solana account <VAULT_ADDRESS>
```

## Security Features

- **110% Collateral Ratio:** Over-collateralized for safety
- **Merkle Tree Verification:** Cryptographic proof of asset integrity
- **Multi-sig Governance:** 3/5 signature requirement
- **Emergency Pause:** Immediate halt if needed
- **Circuit Breakers:** Automatic pause at 90% collateral ratio
- **Audit Trail:** All transactions logged and verifiable

## Risk Controls

### Collateral Thresholds
- **Target:** 110%
- **Warning:** 105%
- **Critical:** 100%
- **Emergency:** 95%

### Governance
- Multi-sig authority (3/5 required)
- 24-hour timelock for critical changes
- Emergency pause capability (2/5 signatures)
- Transparent upgrade process

## Monitoring

### Health Checks
```bash
# Run health check
python collateral_verifier.py
```

### Alerts
- Collateral ratio drops below threshold
- Merkle root verification fails
- Emergency pause triggered
- Governance actions required

## Files

- `DESIGN.md` - System architecture and design
- `programs/collateral_usd/src/lib.rs` - Anchor smart contract
- `collateral_verifier.py` - Collateral verification system
- `deploy.py` - Deployment script
- `generate_merkle_trees.py` - Merkle tree generation

## License

MIT License

## Disclaimer

This is a proof-of-concept collateral-backed token. The collateral valuation is an estimate based on current market conditions. No guarantee of price stability or liquidity is provided. Use at your own risk.
