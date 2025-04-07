import { CounterCard } from "@/components/counter/CounterCard";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>

      <div className="relative z-10 mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
          Solana Counter App
        </h1>
        <p className="text-gray-400">
          A minimal dApp built with Anchor & Next.js
        </p>
      </div>

      <div className="relative z-10">
        <CounterCard />
      </div>

      <footer className="mt-20 text-center text-sm text-gray-500 relative z-10">
        <p>Powered by Anchor, Web3.js, and Shadcn UI</p>
        <p className="mt-2">Created as a minimal Solana dApp example</p>
      </footer>
    </div>
  );
}
