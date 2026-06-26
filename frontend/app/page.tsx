import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
          PulseCheck
        </h1>
        <p className="text-lg text-zinc-600">
          Weekly check-ins and trend alerts for online fitness coaches.
        </p>
        <div className="flex gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
