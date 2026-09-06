// Sfondo "cosmico" della sezione Universo: nebulose morbide nei colori del
// brand + campo stellare che deriva lentamente. Fisso dietro al contenuto,
// non interattivo. Le stelle sono deterministiche (stesso disegno sempre).

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STARS = (() => {
  const rand = mulberry32(77);
  return Array.from({ length: 130 }, (_, i) => ({
    x: +(rand() * 100).toFixed(2),
    y: +(rand() * 100).toFixed(2),
    r: +(0.25 + rand() * 0.9).toFixed(2),
    o: +(0.12 + rand() * 0.5).toFixed(2),
    twinkle: rand() < 0.22,
    delay: +(i % 7).toFixed(0),
  }));
})();

export default function CosmicBackground() {
  return (
    <div
      aria-hidden
      className="cosmic-bg pointer-events-none fixed inset-[-4%] -z-10"
      style={{
        background: `
          radial-gradient(ellipse 42% 32% at 12% 18%, rgb(185 168 230 / 0.12), transparent 70%),
          radial-gradient(ellipse 38% 42% at 88% 78%, rgb(239 108 78 / 0.09), transparent 70%),
          radial-gradient(ellipse 55% 45% at 62% 6%, rgb(46 42 181 / 0.16), transparent 70%),
          var(--fondo)`,
      }}
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#F6ECD8"
            opacity={s.o}
            className={s.twinkle ? "cosmic-star-tw" : undefined}
            style={s.twinkle ? { animationDelay: `${s.delay * 0.6}s` } : undefined}
          />
        ))}
      </svg>
    </div>
  );
}
