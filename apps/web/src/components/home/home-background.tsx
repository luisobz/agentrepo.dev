const NOISE_TEXTURE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/** Premium home backdrop: warm gradient, soft vignette and low-opacity noise. */
export function HomeBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[-1]">
      <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_-5%,rgba(122,34,48,0.08),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_110%,rgba(47,93,138,0.06),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_40%,transparent_60%,rgba(22,22,22,0.07)_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{ backgroundImage: NOISE_TEXTURE }}
      />
    </div>
  );
}
