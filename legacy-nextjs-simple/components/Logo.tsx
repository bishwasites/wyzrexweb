// Logo slot. Two source files are swapped by theme: logo.png (dark
// wordmark) for light backgrounds, logo-white.png (white wordmark) for
// dark ones. Pass alwaysWhite for panels that are always dark (footer).
export default function Logo({ alwaysWhite = false }: { alwaysWhite?: boolean }) {
  if (alwaysWhite) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="logo-img" src="/assets/logo/logo-white.png" alt="WYZREX" />;
  }
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="logo-img logo-img--light" src="/assets/logo/logo.png" alt="WYZREX" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="logo-img logo-img--dark" src="/assets/logo/logo-white.png" alt="WYZREX" />
    </>
  );
}
