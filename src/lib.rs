use borsh::{BorshDeserialize,BorshSerialize};
use solana_program::{
    entrypoint,
    account_info::{next_account_info,AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    program_error::ProgramError
};

#[derive(BorshDeserialize,BorshSerialize)]
struct CounterState{
    count:u32
}

#[derive(BorshDeserialize,BorshSerialize)]
enum  Instruction{
    Init,
    Double,
    Half,
    Add{amt:u32},
    Sub{amt:u32}    
}

entrypoint!(process_instruction);

fn process_instruction(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8]
)->ProgramResult{

    let instruction=Instruction::try_from_slice(instruction_data)?;

    let mut iter=accounts.iter();
    let data_acc=next_account_info(&mut iter)?;
    if !data_acc.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    let mut counter_state=CounterState::try_from_slice(&data_acc.data.borrow())?;

    match instruction {
        Instruction::Init=>{
            counter_state.count=1;
        }

        Instruction::Double=>{
            counter_state.count=counter_state.count.saturating_mul(2);
        }

        Instruction::Half=>{
            counter_state.count=counter_state.count/2;
        }

        Instruction::Add { amt }=>{
            counter_state.count=counter_state.count.saturating_add(amt);
        }

        Instruction::Sub { amt }=>{
            counter_state.count=counter_state.count.saturating_sub(amt);
        }
    }

    counter_state.serialize(&mut *data_acc.data.borrow_mut())?;

    Ok(())
}
