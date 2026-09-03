type BridgeInfographicProps = {
  locale: "tr" | "en";
  label: string;
};

export function BridgeInfographic({ locale, label }: BridgeInfographicProps) {
  const turkey = locale === "tr" ? "TÜRKİYE" : "TÜRKİYE";
  const unitedStates = locale === "tr" ? "AMERİKA" : "UNITED STATES";
  const bridgeLabel =
    locale === "tr" ? "KÜLTÜRLER ARASI KÖPRÜ" : "A BRIDGE BETWEEN CULTURES";

  return (
    <svg
      aria-label={label}
      className="bridge-infographic"
      role="img"
      viewBox="0 0 760 480"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bridge-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f7fbff" />
          <stop offset="1" stopColor="#dcecf4" />
        </linearGradient>
        <linearGradient id="bridge-water" x1="0" x2="1">
          <stop offset="0" stopColor="#0d3059" />
          <stop offset="0.5" stopColor="#25639a" />
          <stop offset="1" stopColor="#0d3059" />
        </linearGradient>
        <filter id="bridge-shadow" height="150%" width="150%" x="-25%" y="-25%">
          <feDropShadow dx="0" dy="12" floodColor="#092443" floodOpacity=".18" stdDeviation="10" />
        </filter>
        <clipPath id="us-flag-clip">
          <rect height="112" rx="5" width="168" x="538" y="70" />
        </clipPath>
      </defs>

      <rect fill="url(#bridge-sky)" height="480" rx="36" width="760" />
      <circle cx="380" cy="104" fill="#f4c95d" opacity=".35" r="52" />
      <path
        d="M0 328c116-32 203-25 296 4 91 28 187 27 279-2 68-21 130-21 185-6v156H0Z"
        fill="url(#bridge-water)"
      />
      <path d="M0 360c118-19 223-9 316 14 105 26 225 25 444-13" fill="none" opacity=".3" stroke="#fff" strokeWidth="4" />
      <path d="M0 409c142-21 256-7 352 13 102 22 211 18 408-10" fill="none" opacity=".18" stroke="#fff" strokeWidth="3" />

      <g filter="url(#bridge-shadow)">
        <rect fill="#e30a17" height="112" rx="5" width="168" x="54" y="70" />
        <circle cx="133" cy="126" fill="#fff" r="31" />
        <circle cx="145" cy="126" fill="#e30a17" r="25" />
        <path d="m166 126 10-3.3-6.2 8.6v-10.6l6.2 8.6Z" fill="#fff" transform="scale(1.45) translate(-53 -39.2)" />

        <g clipPath="url(#us-flag-clip)">
          <rect fill="#fff" height="112" width="168" x="538" y="70" />
          {[0, 2, 4, 6, 8, 10, 12].map((stripe) => (
            <rect
              fill="#b31942"
              height="8.62"
              key={stripe}
              width="168"
              x="538"
              y={70 + stripe * 8.62}
            />
          ))}
          <rect fill="#0a3161" height="60.3" width="70.6" x="538" y="70" />
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 6 }).map((__, column) => (
              <circle
                cx={544 + column * 11.5}
                cy={76 + row * 11.5}
                fill="#fff"
                key={`${row}-${column}`}
                r="1.7"
              />
            )),
          )}
        </g>
      </g>

      <path d="M88 182v119M672 182v119" stroke="#8ca5b7" strokeWidth="5" />
      <path d="M50 302h174M536 302h174" opacity=".55" stroke="#8ca5b7" strokeWidth="4" />

      <g filter="url(#bridge-shadow)">
        <path d="M154 337h452" stroke="#fff" strokeWidth="15" />
        <path d="M154 337h452" stroke="#142f52" strokeWidth="7" />
        <path d="M238 337V194M522 337V194" stroke="#142f52" strokeWidth="12" />
        <path d="M219 200h38M503 200h38" stroke="#142f52" strokeWidth="8" />
        <path
          d="M154 230c34 0 64 24 84 56 39-78 91-92 142-92s103 14 142 92c20-32 50-56 84-56"
          fill="none"
          stroke="#d3182a"
          strokeWidth="6"
        />
        {[182, 210, 266, 294, 322, 350, 378, 406, 434, 462, 518, 546, 574].map((x) => {
          const cableY =
            x < 238
              ? 230 + Math.max(0, x - 154) * 0.65
              : x > 522
                ? 230 + Math.max(0, 606 - x) * 0.65
                : 194 + Math.abs(x - 380) * 0.24;
          return (
            <path
              d={`M${x} ${cableY}V333`}
              key={x}
              opacity=".82"
              stroke="#d3182a"
              strokeWidth="2.5"
            />
          );
        })}
        <path d="M151 348h458" opacity=".75" stroke="#f4c95d" strokeDasharray="14 10" strokeWidth="3" />
      </g>

      <g fill="#fff" textAnchor="middle">
        <text fontFamily="Arial, sans-serif" fontSize="13" fontWeight="800" letterSpacing="2" x="138" y="387">
          {turkey}
        </text>
        <text fontFamily="Arial, sans-serif" fontSize="13" fontWeight="800" letterSpacing="2" x="622" y="387">
          {unitedStates}
        </text>
      </g>
      <g transform="translate(380 408)">
        <rect fill="#fff" height="35" rx="18" width="246" x="-123" />
        <text
          fill="#142f52"
          fontFamily="Arial, sans-serif"
          fontSize="11"
          fontWeight="900"
          letterSpacing="1.5"
          textAnchor="middle"
          x="0"
          y="22"
        >
          {bridgeLabel}
        </text>
      </g>
    </svg>
  );
}
