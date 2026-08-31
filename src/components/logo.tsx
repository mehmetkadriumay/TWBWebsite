import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="Turks Without Borders ana sayfa">
      <Image
        alt="Turks Without Borders"
        className="brand-logo"
        height={301}
        priority
        src="/brand/twb-logo.png"
        width={900}
      />
    </Link>
  );
}
