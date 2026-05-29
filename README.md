# Collateral Token — Reviewed Evidence Token Prototype

Experimental Solana/Anchor program for representing reviewed software-asset evidence packets on-chain.

This repository is **not** a launched USD stablecoin, not a public investment product, and not a guarantee of redemption, market value, or liquidity.

## Overview

The program can store and update compact state for a reviewed evidence packet:

- authority
- token mint
- reviewed evidence valuation in USD cents
- token supply in mint atoms
- evidence Merkle root
- required ratio in basis points
- emergency pause flag

The off-chain evidence packet must be produced and reviewed separately. The program does not appraise software assets by itself.

## Intended Architecture

```text
DollarFS / evidence engine
    -> reviewed appraisal packet
    -> file manifest hash
    -> appraisal report hash
    -> evidence Merkle root
    -> Solana representation token / receipt state
```

The token layer references reviewed evidence. It must not invent value.

## What is implemented

- Anchor vault initialization
- authority-gated Merkle root update
- authority-gated reviewed valuation update
- authority-gated minting
- token-owner burn
- emergency pause
- authority transfer
- ratio checks using cents versus token atoms

## What is not implemented

- production deployment
- verified program id
- legal review
- redemption system
- independent appraisal oracle
- external proof of market value
- audited governance
- formal collateral or lending approval

## Token accounting

The program treats token supply as 6-decimal mint atoms.

```text
1 token = 1_000_000 atoms
1 USD = 100 cents
ratio_bps = reviewed_value_cents * 10_000 / supply_value_cents
```

Minting is restricted to the vault authority. Public permissionless minting is intentionally not supported in this prototype.

## Build

```bash
anchor build
```

## Devnet deployment

Only deploy after replacing the placeholder program id in:

- `programs/collateral_usd/src/lib.rs`
- `Anchor.toml`

Then:

```bash
anchor deploy --provider.cluster devnet
```

## Evidence packet requirements

A real evidence packet should include:

- packet id
- packet hash
- file manifest hash
- appraisal report hash
- reviewer signature
- reviewed value in cents
- confidence score
- risk flags
- expiration or review date
- status: draft, reviewed, superseded, revoked

## Safety boundary

Use accurate wording:

- "reviewed evidence token"
- "evidence receipt"
- "software-asset evidence representation"
- "prototype"

Avoid overclaiming:

- do not call it a live stablecoin
- do not claim guaranteed backing
- do not claim guaranteed liquidity
- do not claim legal collateral status
- do not claim redemption rights without a separate legal and operational structure

## Related system

This repo is intended to sit downstream of a file appraisal/evidence engine such as DollarFS. DollarFS should produce the reviewed packet; this program can reference the packet hash and enforce basic on-chain accounting around a representation token.

## License

MIT License
