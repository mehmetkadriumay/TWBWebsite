import Link from "next/link";
import { GlobeIcon } from "@/components/icons";

export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="Turks Without Borders ana sayfa">
      <span className="logo-mark">
        <GlobeIcon size={25} />
      </span>
      <span className="logo-type">
        <strong>Turks</strong>
        <span>without borders</span>
      </span>
    </Link>
  );
}
