import * as anchor from "@coral-xyz/anchor";

import { Counter } from "../target/types/counter";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";

describe("counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.counter as Program<Counter>;
  const wallet = provider.wallet;

  // Find the PDA for the counter account
  const [counterPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    program.programId
  );

  // Find the vault PDA for the user
  const [vaultPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), wallet.publicKey.toBuffer()],
    program.programId
  );

  // Track the last known counter value
  let lastCounterValue = 0;

  // Amount of SOL to transfer from user to vault and back per increment/decrement
  const TRANSFER_AMOUNT = 1_000_000; // 0.001 SOL

  it("Creates counter and increments on first call", async () => {
    // Get initial balances
    const initialUserBalance = await provider.connection.getBalance(
      wallet.publicKey
    );
    const initialVaultBalance = await provider.connection.getBalance(vaultPDA);

    // Call the increment instruction
    const tx = await program.methods.increment().rpc();
    console.log("Your transaction signature", tx);

    // Get final balances
    const finalUserBalance = await provider.connection.getBalance(
      wallet.publicKey
    );
    const finalVaultBalance = await provider.connection.getBalance(vaultPDA);

    // Check counter value
    const counterAccount = await program.account.counter.fetch(counterPDA);
    const currentValue = counterAccount.count.toNumber();
    expect(currentValue).to.be.greaterThan(lastCounterValue);
    expect(currentValue - lastCounterValue).to.equal(1);

    // Verify lamport transfers (accounting for transaction fees)
    expect(initialVaultBalance).to.equal(0);
    expect(finalVaultBalance).to.equal(TRANSFER_AMOUNT);

    lastCounterValue = currentValue;
  });

  it("Increments the counter on subsequent calls", async () => {
    // Get initial balances
    const initialUserBalance = await provider.connection.getBalance(
      wallet.publicKey
    );
    const initialVaultBalance = await provider.connection.getBalance(vaultPDA);

    // Call increment
    const tx = await program.methods.increment().rpc();
    console.log("Your transaction signature", tx);

    // Get final balances
    const finalUserBalance = await provider.connection.getBalance(
      wallet.publicKey
    );
    const finalVaultBalance = await provider.connection.getBalance(vaultPDA);

    // Check counter value
    const counterAccount = await program.account.counter.fetch(counterPDA);
    const currentValue = counterAccount.count.toNumber();
    expect(currentValue).to.be.greaterThan(lastCounterValue);
    expect(currentValue - lastCounterValue).to.equal(1);

    // Verify lamport transfers
    expect(finalVaultBalance - initialVaultBalance).to.equal(TRANSFER_AMOUNT);

    lastCounterValue = currentValue;
  });

  it("Decrements the counter successfully", async () => {
    // Get initial balances
    const initialUserBalance = await provider.connection.getBalance(
      wallet.publicKey
    );
    const initialVaultBalance = await provider.connection.getBalance(vaultPDA);

    // Call decrement
    const tx = await program.methods.decrement().rpc();
    console.log("Your transaction signature", tx);

    // Get final balances
    const finalUserBalance = await provider.connection.getBalance(
      wallet.publicKey
    );
    const finalVaultBalance = await provider.connection.getBalance(vaultPDA);

    // Check counter value
    const counterAccount = await program.account.counter.fetch(counterPDA);
    const currentValue = counterAccount.count.toNumber();
    expect(currentValue).to.be.lessThan(lastCounterValue);
    expect(lastCounterValue - currentValue).to.equal(1);

    // Verify lamport transfers (accounting for transaction fees)
    expect(initialVaultBalance - finalVaultBalance).to.equal(TRANSFER_AMOUNT);

    lastCounterValue = currentValue;
  });

  it("Fails to decrement when counter is at zero", async () => {
    // First, decrement until we reach zero
    while (lastCounterValue > 0) {
      const initialVaultBalance = await provider.connection.getBalance(
        vaultPDA
      );

      await program.methods.decrement().rpc();

      const finalVaultBalance = await provider.connection.getBalance(vaultPDA);
      expect(initialVaultBalance - finalVaultBalance).to.equal(TRANSFER_AMOUNT);

      const counterAccount = await program.account.counter.fetch(counterPDA);
      lastCounterValue = counterAccount.count.toNumber();
    }

    // Get initial balances
    const initialVaultBalance = await provider.connection.getBalance(vaultPDA);

    // Now try to decrement when counter is at zero
    try {
      await program.methods.decrement().rpc();
      expect.fail("Expected decrement to fail when counter is at zero");
    } catch (error) {
      // Verify that we get the expected error
      expect(error.message).to.include(
        "Counter cannot be decremented below zero"
      );

      // Verify vault balance didn't change since transaction failed
      const finalVaultBalance = await provider.connection.getBalance(vaultPDA);
      expect(finalVaultBalance).to.equal(initialVaultBalance);
    }
  });
});
