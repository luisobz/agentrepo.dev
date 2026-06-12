import Link from 'next/link';

export default function PortfolioNotFound() {
  return (
    <div className="-mt-24 flex min-h-screen flex-col items-center justify-center bg-[#14110f] px-4 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.08em] text-[#8d8273]">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#fdf8ef]">
        Portfolio not found
      </h1>
      <Link
        href="/"
        className="mt-6 font-mono text-sm text-[#c4909a] underline-offset-4 hover:underline"
      >
        ← Volver al Repositorio
      </Link>
    </div>
  );
}
