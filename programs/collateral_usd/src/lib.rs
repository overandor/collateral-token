use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount, burn, mint_to};

// Replace with the deployed program id after `anchor deploy`.
declare_id!("CUsD111111111111111111111111111111111111111");

const TOKEN_DECIMALS: u32 = 6;
const ATOMS_PER_TOKEN: u128 = 10u128.pow(TOKEN_DECIMALS);
const CENTS_PER_USD: u128 = 100;
const BPS_DENOMINATOR: u128 = 10_000;

#[program]
pub mod collateral_usd {
    use super::*;

    /// Initialize the proof-token vault.
    ///
    /// This program is a research/prototype representation layer for reviewed
    /// software-asset evidence. It does not by itself prove legal collateral
    /// status, resale value, liquidity, or redemption rights.
    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        collateral_ratio_bps: u16,
        emergency_pause: bool,
    ) -> Result<()> {
        require!(collateral_ratio_bps >= 10_000 && collateral_ratio_bps <= 50_000, CollateralError::InvalidRatio);

        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.token_mint = ctx.accounts.token_mint.key();
        vault.collateral_ratio_bps = collateral_ratio_bps;
        vault.emergency_pause = emergency_pause;
        vault.total_collateral_cents = 0;
        vault.total_supply_atoms = 0;
        vault.merkle_root = [0u8; 32];
        vault.bump = ctx.bumps.vault;

        emit!(VaultInitialized {
            authority: vault.authority,
            token_mint: vault.token_mint,
            collateral_ratio_bps,
        });

        msg!("Vault initialized with authority: {:?}", vault.authority);
        Ok(())
    }

    /// Update the Merkle root for the reviewed evidence packet.
    pub fn update_merkle_root(
        ctx: Context<UpdateMerkleRoot>,
        new_root: [u8; 32],
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.authority == ctx.accounts.authority.key(), CollateralError::Unauthorized);

        vault.merkle_root = new_root;

        emit!(MerkleRootUpdated {
            token_mint: vault.token_mint,
            new_root,
        });

        msg!("Evidence Merkle root updated: {:?}", new_root);
        Ok(())
    }

    /// Update reviewed evidence valuation in USD cents.
    ///
    /// The value must come from an off-chain reviewed evidence packet. The
    /// program stores the amount and enforces ratio math; it does not appraise
    /// assets by itself.
    pub fn update_collateral_valuation(
        ctx: Context<UpdateCollateralValuation>,
        new_valuation_cents: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.authority == ctx.accounts.authority.key(), CollateralError::Unauthorized);

        vault.total_collateral_cents = new_valuation_cents;

        let current_ratio = collateral_ratio_bps(
            vault.total_collateral_cents,
            vault.total_supply_atoms,
        )?;

        require!(current_ratio >= vault.collateral_ratio_bps as u64, CollateralError::InsufficientCollateral);

        emit!(CollateralValuationUpdated {
            token_mint: vault.token_mint,
            total_collateral_cents: new_valuation_cents,
            ratio_bps: current_ratio,
        });

        msg!("Reviewed evidence valuation updated: {} cents", new_valuation_cents);
        msg!("Current ratio: {} bps", current_ratio);
        Ok(())
    }

    /// Mint representation tokens against reviewed evidence.
    ///
    /// Only the vault authority may mint. Public permissionless minting is not
    /// allowed in this prototype.
    pub fn mint_collateral_usd(
        ctx: Context<MintCollateralUsd>,
        amount_atoms: u64,
    ) -> Result<()> {
        require!(!ctx.accounts.vault.emergency_pause, CollateralError::EmergencyPause);
        require!(ctx.accounts.vault.authority == ctx.accounts.authority.key(), CollateralError::Unauthorized);

        let new_supply = ctx.accounts.vault.total_supply_atoms
            .checked_add(amount_atoms)
            .ok_or(CollateralError::MathOverflow)?;

        let new_ratio = collateral_ratio_bps(
            ctx.accounts.vault.total_collateral_cents,
            new_supply,
        )?;
        require!(new_ratio >= ctx.accounts.vault.collateral_ratio_bps as u64, CollateralError::InsufficientCollateral);

        let token_mint_key = ctx.accounts.vault.token_mint;
        let bump = ctx.accounts.vault.bump;
        let seeds = &[
            b"vault",
            token_mint_key.as_ref(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.destination.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        mint_to(cpi_ctx, amount_atoms)?;

        let vault = &mut ctx.accounts.vault;
        vault.total_supply_atoms = new_supply;

        emit!(TokensMinted {
            token_mint: vault.token_mint,
            amount_atoms,
            total_supply_atoms: vault.total_supply_atoms,
            ratio_bps: new_ratio,
        });

        msg!("Minted {} token atoms", amount_atoms);
        msg!("New total supply atoms: {}", vault.total_supply_atoms);
        msg!("Ratio: {} bps", new_ratio);
        Ok(())
    }

    /// Burn representation tokens.
    pub fn burn_collateral_usd(
        ctx: Context<BurnCollateralUsd>,
        amount_atoms: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        require!(!vault.emergency_pause, CollateralError::EmergencyPause);
        require!(vault.total_supply_atoms >= amount_atoms, CollateralError::InsufficientSupply);

        let cpi_accounts = Burn {
            mint: ctx.accounts.token_mint.to_account_info(),
            from: ctx.accounts.source.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        burn(cpi_ctx, amount_atoms)?;

        vault.total_supply_atoms = vault.total_supply_atoms
            .checked_sub(amount_atoms)
            .ok_or(CollateralError::MathOverflow)?;

        emit!(TokensBurned {
            token_mint: vault.token_mint,
            amount_atoms,
            total_supply_atoms: vault.total_supply_atoms,
        });

        msg!("Burned {} token atoms", amount_atoms);
        msg!("New total supply atoms: {}", vault.total_supply_atoms);
        Ok(())
    }

    /// Set emergency pause.
    pub fn set_emergency_pause(
        ctx: Context<SetEmergencyPause>,
        pause: bool,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.authority == ctx.accounts.authority.key(), CollateralError::Unauthorized);

        vault.emergency_pause = pause;

        emit!(EmergencyPauseSet {
            token_mint: vault.token_mint,
            paused: pause,
        });

        msg!("Emergency pause: {}", pause);
        Ok(())
    }

    /// Update required ratio in basis points.
    pub fn update_collateral_ratio(
        ctx: Context<UpdateCollateralRatio>,
        new_ratio_bps: u16,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.authority == ctx.accounts.authority.key(), CollateralError::Unauthorized);
        require!(new_ratio_bps >= 10_000 && new_ratio_bps <= 50_000, CollateralError::InvalidRatio);

        let current_ratio = collateral_ratio_bps(
            vault.total_collateral_cents,
            vault.total_supply_atoms,
        )?;
        require!(current_ratio >= new_ratio_bps as u64, CollateralError::InsufficientCollateral);

        vault.collateral_ratio_bps = new_ratio_bps;

        emit!(CollateralRatioUpdated {
            token_mint: vault.token_mint,
            new_ratio_bps,
        });

        msg!("Ratio updated to {} bps", new_ratio_bps);
        Ok(())
    }

    /// Transfer authority.
    pub fn transfer_authority(
        ctx: Context<TransferAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.authority == ctx.accounts.authority.key(), CollateralError::Unauthorized);

        let old_authority = vault.authority;
        vault.authority = new_authority;

        emit!(AuthorityTransferred {
            token_mint: vault.token_mint,
            old_authority,
            new_authority,
        });

        msg!("Authority transferred to: {:?}", new_authority);
        Ok(())
    }
}

fn supply_value_cents(total_supply_atoms: u64) -> Result<u64> {
    if total_supply_atoms == 0 {
        return Ok(0);
    }
    let atoms = total_supply_atoms as u128;
    let numerator = atoms
        .checked_mul(CENTS_PER_USD)
        .ok_or(CollateralError::MathOverflow)?;
    let cents = numerator
        .checked_add(ATOMS_PER_TOKEN - 1)
        .ok_or(CollateralError::MathOverflow)?
        .checked_div(ATOMS_PER_TOKEN)
        .ok_or(CollateralError::MathOverflow)?;
    u64::try_from(cents).map_err(|_| CollateralError::MathOverflow.into())
}

fn collateral_ratio_bps(total_collateral_cents: u64, total_supply_atoms: u64) -> Result<u64> {
    let supply_cents = supply_value_cents(total_supply_atoms)?;
    if supply_cents == 0 {
        return Ok(u64::MAX);
    }
    let numerator = (total_collateral_cents as u128)
        .checked_mul(BPS_DENOMINATOR)
        .ok_or(CollateralError::MathOverflow)?;
    let ratio = numerator
        .checked_div(supply_cents as u128)
        .ok_or(CollateralError::MathOverflow)?;
    u64::try_from(ratio).map_err(|_| CollateralError::MathOverflow.into())
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::SIZE,
        seeds = [b"vault", token_mint.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateMerkleRoot<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.token_mint.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateCollateralValuation<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.token_mint.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct MintCollateralUsd<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.token_mint.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    pub authority: Signer<'info>,

    #[account(mut)]
    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = destination.mint == token_mint.key() @ CollateralError::InvalidMint
    )]
    pub destination: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnCollateralUsd<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.token_mint.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = source.mint == token_mint.key() @ CollateralError::InvalidMint
    )]
    pub source: Account<'info, TokenAccount>,

    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SetEmergencyPause<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.token_mint.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateCollateralRatio<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.token_mint.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferAuthority<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.token_mint.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    pub authority: Signer<'info>,
}

#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub collateral_ratio_bps: u16,
    pub emergency_pause: bool,
    pub total_collateral_cents: u64,
    pub total_supply_atoms: u64,
    pub merkle_root: [u8; 32],
    pub bump: u8,
}

impl Vault {
    pub const SIZE: usize = 32 + 32 + 2 + 1 + 8 + 8 + 32 + 1;
}

#[error_code]
pub enum CollateralError {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Insufficient reviewed evidence value for requested supply")]
    InsufficientCollateral,
    #[msg("Emergency pause active")]
    EmergencyPause,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Insufficient token supply")]
    InsufficientSupply,
    #[msg("Invalid mint")]
    InvalidMint,
    #[msg("Invalid ratio")]
    InvalidRatio,
}

#[event]
pub struct VaultInitialized {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub collateral_ratio_bps: u16,
}

#[event]
pub struct MerkleRootUpdated {
    pub token_mint: Pubkey,
    pub new_root: [u8; 32],
}

#[event]
pub struct CollateralValuationUpdated {
    pub token_mint: Pubkey,
    pub total_collateral_cents: u64,
    pub ratio_bps: u64,
}

#[event]
pub struct TokensMinted {
    pub token_mint: Pubkey,
    pub amount_atoms: u64,
    pub total_supply_atoms: u64,
    pub ratio_bps: u64,
}

#[event]
pub struct TokensBurned {
    pub token_mint: Pubkey,
    pub amount_atoms: u64,
    pub total_supply_atoms: u64,
}

#[event]
pub struct EmergencyPauseSet {
    pub token_mint: Pubkey,
    pub paused: bool,
}

#[event]
pub struct CollateralRatioUpdated {
    pub token_mint: Pubkey,
    pub new_ratio_bps: u16,
}

#[event]
pub struct AuthorityTransferred {
    pub token_mint: Pubkey,
    pub old_authority: Pubkey,
    pub new_authority: Pubkey,
}
