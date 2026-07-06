'use client';

const PIECES = Array.from({ length: 24 }, (_, index) => index);
const COLORS = ['#c4909a', '#7a2230', '#e8c2ca', '#8aaac8', '#f4ecdd', '#34d399'];

/** Lightweight CSS confetti shown after a successful deploy. */
export function ConfettiBurst() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      data-testid="confetti-burst"
    >
      {PIECES.map((piece) => {
        const left = (piece * 41) % 100;
        const delay = (piece % 6) * 0.12;
        const duration = 1.6 + ((piece * 7) % 10) / 10;
        const color = COLORS[piece % COLORS.length];
        return (
          <span
            key={piece}
            className="absolute top-[-5%] block h-2.5 w-1.5 animate-[confetti-fall_linear_forwards]"
            style={{
              left: `${left}%`,
              backgroundColor: color,
              animationName: 'confetti-fall',
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              animationTimingFunction: 'ease-in',
              animationFillMode: 'forwards',
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
