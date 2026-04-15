use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Replace with your generated program ID

#[program]
pub mod insurance {
    use super::*;

    pub fn submit_proof(ctx: Context<SubmitProof>, category: u8, proof: String) -> Result<()> {
        let user_record = &mut ctx.accounts.user_record;
        
        user_record.owner = *ctx.accounts.user.key;
        user_record.category = category;
        user_record.proof = proof; // The stringified ZK Proof payload

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SubmitProof<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 1 + 1024, // Enough space for pubkey + uint8 + stringified proof
        seeds = [b"record", user.key().as_ref()],
        bump
    )]
    pub user_record: Account<'info, UserRecord>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserRecord {
    pub owner: Pubkey,
    pub category: u8,
    pub proof: String,
}
