import * as path from 'path';
import {Keypair,LAMPORTS_PER_SOL,PublicKey,SystemProgram,Transaction,TransactionInstruction} from '@solana/web3.js';
import {LiteSVM} from 'litesvm';
import {describe,test,expect,beforeAll} from 'bun:test';

describe("Calculator Program Tests",()=>{

    let svm:LiteSVM;
    let programId:PublicKey;
    let dataAcc:Keypair;
    let userAcc:Keypair;

    const prgPath=path.join(import.meta.dir,"solana_native_calculator.so");

    beforeAll(()=>{
        svm=new LiteSVM();
        programId=PublicKey.unique();
        svm.addProgramFromFile(programId,prgPath);

        dataAcc=new Keypair();
        userAcc=new Keypair();
        svm.airdrop(userAcc.publicKey,BigInt(LAMPORTS_PER_SOL));

        let ix=SystemProgram.createAccount({
            fromPubkey:userAcc.publicKey,
            newAccountPubkey:dataAcc.publicKey,
            lamports:Number(svm.minimumBalanceForRentExemption(BigInt(4))),
            space:4,
            programId
        })

        const txn=new Transaction().add(ix);
        txn.recentBlockhash=svm.latestBlockhash();
        txn.sign(userAcc,dataAcc);
        svm.sendTransaction(txn);
        svm.expireBlockhash();
    })

    test("Init",()=>{
        const ix=new TransactionInstruction({
            programId,
            keys:[
                {pubkey:dataAcc.publicKey,isSigner:true,isWritable:true}
            ],
            data:Buffer.from([0])
        })
        const txn=new Transaction().add(ix);
        txn.recentBlockhash=svm.latestBlockhash();
        txn.sign(userAcc,dataAcc);
        svm.sendTransaction(txn);

        const updatedAccData=svm.getAccount(dataAcc.publicKey);
        if (!updatedAccData){
            throw new Error("Acc not found");
        }
        expect(updatedAccData.data[0]).toBe(1);
        expect(updatedAccData.data[1]).toBe(0);
        expect(updatedAccData.data[2]).toBe(0);
        expect(updatedAccData.data[3]).toBe(0);
    })

    test("Double the value",()=>{
        const ix=new TransactionInstruction({
            programId,
            keys:[
                {pubkey:dataAcc.publicKey,isSigner:true,isWritable:true}
            ],
            data:Buffer.from([1])
        })
        const txn=new Transaction().add(ix);
        txn.recentBlockhash=svm.latestBlockhash();
        txn.sign(userAcc,dataAcc);
        svm.sendTransaction(txn);

        const updatedAccData=svm.getAccount(dataAcc.publicKey);
        if (!updatedAccData){
            throw new Error("Acc not found");
        }
        expect(updatedAccData.data[0]).toBe(2);
        expect(updatedAccData.data[1]).toBe(0);
        expect(updatedAccData.data[2]).toBe(0);
        expect(updatedAccData.data[3]).toBe(0);
    })

    test("Halve the value",()=>{
        const ix=new TransactionInstruction({
            programId,
            keys:[
                {pubkey:dataAcc.publicKey,isSigner:true,isWritable:true}
            ],
            data:Buffer.from([2])
        })
        const txn=new Transaction().add(ix);
        txn.recentBlockhash=svm.latestBlockhash();
        txn.sign(userAcc,dataAcc);
        svm.sendTransaction(txn);

        const updatedAccData=svm.getAccount(dataAcc.publicKey);
        if (!updatedAccData){
            throw new Error("Acc not found");
        }
        expect(updatedAccData.data[0]).toBe(1);
        expect(updatedAccData.data[1]).toBe(0);
        expect(updatedAccData.data[2]).toBe(0);
        expect(updatedAccData.data[3]).toBe(0);
    })
})