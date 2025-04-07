# Solana Counter dApp (Anchor, NextJs, Tailwind CSS and Shadcn/ui)

## Program Overview

### Program Derived Addresses (PDAs)

1. **Counter PDA**

   - Stores the counter's current value
   - Derived using the seed "counter"
   - Global state accessible to all users
   - Automatically initialized on first increment

2. **Vault PDA**
   - Holds SOL tokens from user transactions
   - Derived using:
     - Seed "vault"
     - User's public key
   - Each user gets their own vault
   - Demonstrates using PDAs for CPI signing

### Instructions

1. **Increment**

   - Increases counter value by 1
   - Performs CPI to transfer 0.001 SOL from user to vault
   - Creates counter PDA if it doesn't exist
   - Demonstrates:
     - PDA initialization
     - System program CPI for SOL transfer
     - State management

2. **Decrement**
   - Decreases counter value by 1
   - Performs CPI to transfer 0.001 SOL from vault back to user
   - Demonstrates:
     - PDA signing (vault)
     - System program CPI with PDA as signer

### Cross-Program Invocations (CPIs)

The program demonstrates CPIs through SOL transfers:

- User → Vault (increment): Basic CPI to system program
- Vault → User (decrement): CPI with PDA signing

## Project Structure

```
├── program/             # Solana program (smart contract)
│   ├── programs/        # Program source code
│   ├── tests/           # Program tests
│   └── Anchor.toml      # Anchor configuration
│
└── frontend/           # Next.js frontend
    ├── app/            # app router page and layout
    ├── components/     # React components
    └── anchor-idl/     # Program IDL
```

## Features

1. **Solana Program**

   - Counter state management using PDA
   - Vault system using user-specific PDAs
   - SOL transfer demonstration using CPIs
   - PDA initialization and signing

2. **Frontend Application**
   - Wallet adapter integration
   - Real-time counter updates
   - Transaction toast notifications
   - UI with Tailwind CSS and shadcn/ui

## How to run

### Require

- Node.js 18+ and pnpm
- Rust and Solana CLI tools
- Anchor Framework

### Installation

1. Install program dependencies:

```bash
cd program
pnpm install
anchor build
anchor keys sync
```

2. Install frontend dependencies:

```bash
cd frontend
pnpm install
```

### Development

1. Test the program:

```bash
cd program
anchor test
```

2. Run the frontend:

```bash
cd frontend
pnpm dev
```

## Explain Resources

### Program (Smart Contract)

- `program/programs/counter/src/lib.rs`: Core program logic
  - Instruction handling
  - PDA creation and management
  - CPI implementation

### Frontend Components

- `frontend/components/counter/`: Main dApp components
  - `CounterDisplay.tsx`: Real-time data updates
  - `IncrementButton.tsx` & `DecrementButton.tsx`: Transaction handling
  - `WalletButton.tsx`: Wallet adapter button

### Custom Hooks

- `frontend/components/counter/hooks/`:
  - `useProgram.tsx`: Program initialization and wallet management
  - `useTransactionToast.tsx`: Transaction notification
