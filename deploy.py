#!/usr/bin/env python3
"""
Deployment script for CUSD collateral-backed token
Handles initialization, Merkle root setup, and collateral valuation
"""

import json
import sys
from pathlib import Path
from solana.rpc.async_api import AsyncClient
from solana.keypair import Keypair
from solana.publickey import PublicKey
from anchorpy import Program, Provider, Wallet
from anchorpy.idl import Idl

# Program ID
PROGRAM_ID = "CUsD111111111111111111111111111111111111111"

class CUSDDeployer:
    """Deploy and configure CUSD token system"""
    
    def __init__(self, rpc_url: str, wallet_path: str):
        self.rpc_url = rpc_url
        self.client = AsyncClient(rpc_url)
        self.wallet = self._load_wallet(wallet_path)
        self.provider = Provider(self.client, Wallet(self.wallet))
        
    def _load_wallet(self, wallet_path: str) -> Keypair:
        """Load wallet keypair from file"""
        with open(wallet_path, 'r') as f:
            return Keypair.from_secretkey(json.load(f))
    
    async def load_program(self) -> Program:
        """Load the CUSD program"""
        idl_path = Path(__file__).parent / "target" / "idl" / "collateral_usd.json"
        with open(idl_path, 'r') as f:
            idl = json.load(f)
        
        program = Program(
            idl,
            PROGRAM_ID,
            self.provider
        )
        return program
    
    async def initialize_system(self, program: Program, token_mint: PublicKey):
        """Initialize the vault and token system"""
        # Generate vault PDA
        vault_pda, bump = PublicKey.find_program_address(
            [b"vault", bytes(token_mint)],
            PublicKey(PROGRAM_ID)
        )
        
        # Initialize vault with parameters
        try:
            tx = await program.rpc["initialize_vault"](
                ctx=self.provider.ctx,
                accounts={
                    "vault": vault_pda,
                    "authority": self.wallet.public_key,
                    "token_mint": token_mint,
                    "system_program": PublicKey("11111111111111111111111111111111"),
                },
                args={
                    "collateral_ratio_bps": 11000,  # 110% collateral ratio
                    "emergency_pause": False,
                }
            )
            print(f"✅ Vault initialized: {vault_pda}")
            return vault_pda
        except Exception as e:
            print(f"❌ Vault initialization failed: {e}")
            raise
    
    async def update_merkle_root(self, program: Program, vault_pda: PublicKey, merkle_root: str):
        """Update Merkle root for collateral verification"""
        # Convert hex string to bytes
        merkle_bytes = bytes.fromhex(merkle_root)
        
        try:
            tx = await program.rpc["update_merkle_root"](
                ctx=self.provider.ctx,
                accounts={
                    "vault": vault_pda,
                    "authority": self.wallet.public_key,
                },
                args={
                    "new_root": merkle_bytes,
                }
            )
            print(f"✅ Merkle root updated: {merkle_root}")
        except Exception as e:
            print(f"❌ Merkle root update failed: {e}")
            raise
    
    async def update_collateral_valuation(self, program: Program, vault_pda: PublicKey, valuation_usd: int):
        """Update total collateral valuation (in cents)"""
        try:
            tx = await program.rpc["update_collateral_valuation"](
                ctx=self.provider.ctx,
                accounts={
                    "vault": vault_pda,
                    "authority": self.wallet.public_key,
                },
                args={
                    "new_valuation_usd": valuation_usd,
                }
            )
            print(f"✅ Collateral valuation updated: ${valuation_usd / 100:,.2f} USD")
        except Exception as e:
            print(f"❌ Collateral valuation update failed: {e}")
            raise
    
    async def mint_tokens(self, program: Program, vault_pda: PublicKey, token_mint: PublicKey, 
                         destination: PublicKey, amount: int):
        """Mint CUSD tokens (collateralized)"""
        try:
            tx = await program.rpc["mint_collateral_usd"](
                ctx=self.provider.ctx,
                accounts={
                    "vault": vault_pda,
                    "token_mint": token_mint,
                    "destination": destination,
                    "token_program": PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                },
                args={
                    "amount": amount,
                }
            )
            print(f"✅ Minted {amount} CUSD tokens")
        except Exception as e:
            print(f"❌ Mint failed: {e}")
            raise
    
    async def burn_tokens(self, program: Program, vault_pda: PublicKey, token_mint: PublicKey,
                        source: PublicKey, amount: int):
        """Burn CUSD tokens for redemption"""
        try:
            tx = await program.rpc["burn_collateral_usd"](
                ctx=self.provider.ctx,
                accounts={
                    "vault": vault_pda,
                    "token_mint": token_mint,
                    "source": source,
                    "owner": self.wallet.public_key,
                    "token_program": PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                },
                args={
                    "amount": amount,
                }
            )
            print(f"✅ Burned {amount} CUSD tokens")
        except Exception as e:
            print(f"❌ Burn failed: {e}")
            raise


async def main():
    """Main deployment function"""
    import asyncio
    
    # Configuration
    RPC_URL = "https://api.devnet.solana.com"  # Use devnet for testing
    WALLET_PATH = "/path/to/wallet.json"  # Update with actual path
    TOKEN_MINT = "TOKEN_MINT_ADDRESS"  # Update with actual token mint address
    
    # Load Merkle root from verification system
    base_dir = Path("/Users/alep/Downloads/consolidated_repos")
    merkle_summary = base_dir / "MERKLE_SUMMARY.json"
    
    with open(merkle_summary, 'r') as f:
        merkle_data = json.load(f)
        merkle_root = merkle_data["overall_merkle_root"]
    
    # Load collateral valuation
    collateral_proof = base_dir / "collateral_token" / "collateral_proof.json"
    with open(collateral_proof, 'r') as f:
        proof = json.load(f)
        collateral_usd_cents = proof["total_collateral_cents"]
    
    print(f"🚀 Deploying CUSD Token System")
    print(f"   Merkle Root: {merkle_root}")
    print(f"   Collateral: ${collateral_usd_cents / 100:,.2f} USD")
    
    # Initialize deployer
    deployer = CUSDDeployer(RPC_URL, WALLET_PATH)
    program = await deployer.load_program()
    
    # Initialize vault
    vault_pda = await deployer.initialize_system(program, PublicKey(TOKEN_MINT))
    
    # Update Merkle root
    await deployer.update_merkle_root(program, vault_pda, merkle_root)
    
    # Update collateral valuation
    await deployer.update_collateral_valuation(program, vault_pda, collateral_usd_cents)
    
    print("✅ Deployment complete!")
    print(f"   Vault Address: {vault_pda}")
    print(f"   Token Mint: {TOKEN_MINT}")


if __name__ == "__main__":
    asyncio.run(main())
