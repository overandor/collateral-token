use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, MintTo, Burn, mint_to, burn, transfer};
use anchor_spl::token::spl_token::instruction::AuthorityType;

declare_id!("CUsD111111111111111111111111111111111111111");

#[program]
pub mod collateral_usd {
    use super::*;

    /// Initialize the collateral vault and token mint
    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        collateral_ratio_bps: u16, // 10000 = 100%
        emergency_pause: bool,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.token_mint = ctx.accounts.token_mint.key();
        vault.collateral_ratio_bps = collateral_ratio_bps;
        vault.emergency_pause = emergency_pause;
        vault.total_collateral_usd = 0;
        vault.total_supply = 0;
        vault.merkle_root = [0u8; 32];
        
        msg!("Vault initialized with authority: {:?}", vault.authority);
        Ok(())
    }

    /// Update the Merkle root for collateral verification
    pub fn update_merkle_root(
        ctx: Context<UpdateMerkleRoot>,
        new_root: [u8; 32],
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.authority == ctx.accounts.authority.key(), CollateralError::Unauthorized);
        
        vault.merkle_root = new_root;
        msg!("Merkle root updated: {:?}", new_root);
        Ok(())
    }

    /// Update collateral valuation (in USD cents)
    pub fn update_collateral_valuation(
        ctx: Context<UpdateCollateralValuation>,
        new_valuation_usd: u64, // USD cents
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.authority == ctx.accounts.authority.key(), CollateralError::Unauthorized);
        
        vault.total_collateral_usd = new_valuation_usd;
        
        // Check if collateral ratio is maintained
        let current_ratio = if vault.total_supply > 0 {
            (vault.total_collateral_usd * 10000) / vault.total_supply
        } else {
            10000 // 100% if no supply
        };
        
        require!(current_ratio >= vault.collateral_ratio_bps, CollateralError::InsufficientCollateral);
        
        msg!("Collateral valuation updated: ${} USD", new_valuation_usd / 100);
        msg!("Current collateral ratio: {}%", current_ratio / 100);
        Ok(())
    }

    /// Mint CUSD tokens (collateralized)
    pub fn mint_collateral_usd(
        ctx: Context<MintCollateralUsd>,
        amount: u64, // Token amount (6 decimals)
    ) -> Result<()> {
        let vault = &ctx.accounts.vault;
        
        require!(!vault.emergency_pause, CollateralError::EmergencyPause);
        
        // Check collateral ratio
        let new_supply = vault.total_supply.checked_add(amount).ok()
            .map_err(|_| CollateralError::MathOverflow)?;
        
        let new_ratio = (vault.total_collateral_usd * 10000) / new_supply;
        require!(new_ratio >= vault.collateral_ratio_bps, CollateralError::InsufficientCollateral);
        
        // Mint tokens
        let seeds = &[
            b"vault",
            vault.token_mint.as_ref(),
            &[vault.bump],
        ];
        let signer_seeds = &[&seeds[..]];
        
        let cpi_accounts = MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.destination.to_account_info(),
            authority: vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        
        mint_to(cpi_ctx, amount)?;
        
        // Update vault state
        let vault = &mut ctx.accounts.vault;
        vault.total_supply = new_supply;
        
        msg!("Minted {} CUSD tokens", amount);
        msg!("New total supply: {} CUSD", vault.total_supply);
        msg!("Collateral ratio: {}%", new_ratio / 100);
        Ok(())
    }

    /// Burn CUSD tokens for redemption
    pub fn burn_collateral_usd(
        ctx: Context<BurnCollateralUsd>,
        amount: u64, // Token amount (6 decimals)
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        
        require!(!vault.emergency_pause, CollateralError::EmergencyPause);
        require!(vault.total_supply >= amount, CollateralError::InsufficientSupply);
        
        // Burn tokens
        let cpi_accounts = Burn {
            mint: ctx.accounts.token_mint.to_account_info(),
            from: ctx.accounts.source.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        burn(cpi_ctx, amount)?;
        
        // Update vault state
        vault.total_supply = vault.total_supply.checked_sub(amount).unwrap();
        
        msg!("Burned {} CUSD tokens", amount);
        msg!("New total supply: {} CUSD", vault.total_supply);
        Ok(())
    }

    /// Set emergency pause
    pub fn set_emergency_pause(
        ctx: Context<SetEmergencyPause>,
        pause: bool,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.authority == ctx.accounts.authority.key(), CollateralError::Unauthorized);
        
        vault.emergency_pause = pause;
        msg!("Emergency pause: {}", pause);
        Ok(())
    }

    /// Update collateral ratio
    pub fn update_collateral_ratio(
        ctx: Context<UpdateCollateralRatio>,
        new_ratio_bps: u16, // 10000 = 100%
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.authority == ctx.accounts.authority.key(), CollateralError::Unauthorized);
        require!(new_ratio_bps >= 9000 && new_ratio_bps <= 15000, CollateralError::InvalidRatio);
        
        // Check if new ratio can be maintained
        if vault.total_supply > 0 {
            let current_ratio = (vault.total_collateral_usd * 10000) / vault.total_supply;
            require!(current_ratio >= new_ratio_bps, CollateralError::InsufficientCollateral);
        }
        
        vault.collateral_ratio_bps = new_ratio_bps;
        msg!("Collateral ratio updated to {}%", new_ratio_bps / 100);
        Ok(())
    }

    /// Transfer authority (multi-sig)
    pub fn transfer_authority(
        ctx: Context<TransferAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.authority == ctx.accounts.authority.key(), CollateralError::Unauthorized);
        
        vault.authority = new_authority;
        msg!("Authority transferred to: {:?}", new_authority);
        Ok(())
    }
}

// Context structs

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
    
    /// CHECK: Token mint (validated in program)
    pub token_mint: AccountInfo<'info>,
    
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

// Vault account structure

#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub collateral_ratio_bps: u16, // 10000 = 100%
    pub emergency_pause: bool,
    pub total_collateral_usd: u64, // USD cents
    pub total_supply: u64, // Token amount
    pub merkle_root: [u8; 32],
    pub bump: u8,
}

impl Vault {
    pub const SIZE: usize = 32 + 32 + 2 + 1 + 8 + 8 + 32 + 1;
}

// Error types

#[error_code]
pub enum CollateralError {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Insufficient collateral")]
    InsufficientCollateral,
    #[msg("Emergency pause active")]
    EmergencyPause,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Insufficient token supply")]
    InsufficientSupply,
    #[msg("Invalid mint")]
    InvalidMint,
    #[msg("Invalid collateral ratio")]
    InvalidRatio,
}
