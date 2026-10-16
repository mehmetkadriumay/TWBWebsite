type IconProps = { size?: number; className?: string };

export function ArrowIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function GlobeIcon({ size = 22, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.5 9h17M3.5 15h17M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function SparkIcon({ size = 22, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d="M12 2c.8 5.8 4.2 9.2 10 10-5.8.8-9.2 4.2-10 10-.8-5.8-4.2-9.2-10-10C7.8 11.2 11.2 7.8 12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PeopleIcon({ size = 22, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-6A3.5 3.5 0 0 0 3 18.5V20m9.5-12.5a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm3-2.8a4 4 0 0 1 0 7.6m2 2.9a3.5 3.5 0 0 1 3.5 3.5V20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function EmailIcon({ size = 22, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <rect
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
        width="19"
        x="2.5"
        y="4.5"
      />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function InstagramIcon({ size = 22, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <rect
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
        width="18"
        x="3"
        y="3"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.7" fill="currentColor" r="1.1" />
    </svg>
  );
}

export function TeamsIcon({ size = 28, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      height={size}
      viewBox="0 0 32 32"
      width={size}
    >
      <circle cx="22.5" cy="6.5" fill="#7B83EB" r="4" />
      <path
        d="M18 11h8.5A3.5 3.5 0 0 1 30 14.5V22a5 5 0 0 1-5 5h-7V11Z"
        fill="#6264A7"
      />
      <rect fill="#7B83EB" height="19" rx="3" width="18" x="5" y="8" />
      <rect fill="#5059C9" height="16" rx="2.5" width="16" x="1" y="10" />
      <path d="M5 14h8v2.5h-2.7V23H7.7v-6.5H5V14Z" fill="white" />
    </svg>
  );
}

export function UploadIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d="M12 16V3m0 0L7 8m5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function DownloadIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d="M12 3v13m0 0 5-5m-5 5-5-5M5 20h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function TrashIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d="M4 7h16m-10 4v6m4-6v6M9 7l1-3h4l1 3m3 0-1 14H7L6 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
