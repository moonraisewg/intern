#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
use anchor_lang::system_program;

// Declare the program ID
declare_id!("BV1aKY8fA4krkagHJSqo7yjMgmQAce2WV1MCHxJnagec");

#[program]
pub mod counter {
    use super::*;

    // Increment instruction - increases the counter value by 1
    // This uses init_if_needed so the counter will be created if it doesn't exist
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        msg!("Incrementing counter");

        // Get a mutable reference to the counter account
        let counter = &mut ctx.accounts.counter;

        // Always increment the counter value
        counter.count += 1;

        // Log the counter value
        msg!("Counter value: {}", counter.count);

        // Set up the CPI (Cross-Program Invocation) to transfer SOL from user to vault
        let cpi_accounts = system_program::Transfer {
            from: ctx.accounts.user.to_account_info(), // Source: user's wallet
            to: ctx.accounts.vault.to_account_info(),  // Destination: program's vault PDA
        };
        // Get the System Program account which will process the transfer
        let cpi_program = ctx.accounts.system_program.to_account_info();
        // Create the CPI Context which bundles the accounts and program
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        // Execute the transfer of 0.001 SOL (1_000_000 lamports) from user to vault
        system_program::transfer(cpi_ctx, 1_000_000)?;

        Ok(())
    }

    // Decrement instruction - decreases the counter value by 1
    pub fn decrement(ctx: Context<Decrement>) -> Result<()> {
        msg!("Decrementing counter");

        // Get a mutable reference to the counter account
        let counter = &mut ctx.accounts.counter;

        // Note: This check is just to demonstrate error handling (program will automatically panic if attempted to decrement below 0)
        // Check if counter is greater than 0 before decrementing
        require!(counter.count > 0, CounterError::UnderflowError);

        // Decrement the counter value
        counter.count -= 1;

        // Log the counter value
        msg!("Counter value: {}", counter.count);

        // Get the user's public key and create the seeds for the vault PDA
        let user_key = ctx.accounts.user.key();
        let seeds = [
            b"vault".as_ref(),  // The string "vault" as bytes
            user_key.as_ref(),  // The user's public key as bytes
            &[ctx.bumps.vault], // The bump seed to make the PDA unique
        ];
        // Create a reference to the seeds for signing
        let signer_seeds = &[&seeds[..]];

        // Set up the CPI to transfer SOL from vault back to user
        let cpi_accounts = system_program::Transfer {
            from: ctx.accounts.vault.to_account_info(), // Source: program's vault PDA
            to: ctx.accounts.user.to_account_info(),    // Destination: user's wallet
        };
        // Get the System Program account
        let cpi_program = ctx.accounts.system_program.to_account_info();
        // Create the CPI Context with signer seeds (needed because vault is a PDA)
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts).with_signer(signer_seeds); // Add PDA signer seeds for program signing

        // Execute the transfer of 0.001 SOL (1_000_000 lamports) from vault to user
        system_program::transfer(cpi_ctx, 1_000_000)?;

        Ok(())
    }
}

// Account structure for the Increment instruction
#[derive(Accounts)]
pub struct Increment<'info> {
    // The user account that signs the transaction
    #[account(mut)]
    pub user: Signer<'info>,

    // The Counter account to be incremented
    // init_if_needed allows this account to be created if it doesn't exist
    #[account(
        init_if_needed,                                 // Initialize if it doesn't exist
        payer = user,                                   // The user pays for the account creation if needed
        space = Counter::LEN,                           // Use the LEN constant from Counter impl
        seeds = [b"counter"],                           // PDA seed "counter"
        bump                                            // Bump seed for PDA derivation
    )]
    pub counter: Account<'info, Counter>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,

    // System program is required for creating accounts
    pub system_program: Program<'info, System>,
}

// Account structure for the Decrement instruction
#[derive(Accounts)]
pub struct Decrement<'info> {
    // The user account that signs the transaction
    #[account(mut)]
    pub user: Signer<'info>,

    // The Counter account to be decremented
    #[account(
        mut,
        seeds = [b"counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

// Counter account data structure
#[account]
#[derive(InitSpace)]
pub struct Counter {
    // The counter value stored as an unsigned 64-bit integer
    pub count: u64,
}

impl Counter {
    // The length of the account discriminator (8 bytes) and the counter value (8 bytes)
    pub const LEN: usize = Self::DISCRIMINATOR.len() + Self::INIT_SPACE;
}

// Error codes for the counter program
#[error_code]
pub enum CounterError {
    #[msg("Counter cannot be decremented below zero")]
    UnderflowError,
}
