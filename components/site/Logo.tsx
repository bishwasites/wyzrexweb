interface LogoProps {
  alwaysWhite?: boolean;
  /** Overrides from site_settings; fall back to the shipped default marks. */
  lightSrc?: string | null;
  darkSrc?: string | null;
}

export default function Logo({ alwaysWhite = false, lightSrc, darkSrc }: LogoProps) {
  const light = lightSrc || "/assets/logo/logo.png";
  const dark = darkSrc || "/assets/logo/logo-white.png";

  if (alwaysWhite) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="h-7 w-auto" src={dark} alt="WYZREX" />;
  }
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="h-7 w-auto dark:hidden" src={light} alt="WYZREX" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hidden h-7 w-auto dark:block" src={dark} alt="WYZREX" />
    </>
  );
}
