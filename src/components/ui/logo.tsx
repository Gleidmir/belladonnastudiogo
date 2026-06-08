export function BarberGoLogo({ className = "w-12 h-12", animate = true }: { className?: string; animate?: boolean }) {
  return (
    <div className={`relative flex items-center justify-center ${animate ? "animate-pulse" : ""} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_0_12px_rgba(74,222,128,0.4)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Double border gold container */}
        <rect
          x="3"
          y="3"
          width="94"
          height="94"
          rx="24"
          stroke="url(#goldGradient)"
          strokeWidth="4"
          fill="#09090b"
        />
        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          rx="19"
          stroke="url(#goldGradient)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />

        {/* Barber silhouette facing right */}
        <g transform="translate(14, 15)">
          {/* Hair back & top */}
          <path
            d="M20,13 C26,7 34,7 40,10 C46,13 48,18 47,24 C44,24 41,22 39,20 C36,18 32,18 29,20 C27,21 26,24 28,26 C29,27 32,27 34,26 C36,25 38,26 38,28 C38,30 35,32 32,32 C28,32 25,30 24,28 C23,27 21,27 20,29 C18,31 18,34 20,36 C22,38 25,38 27,37 C29,36 31,37 31,39 C31,41 28,43 25,43 C20,43 17,40 16,36 C15,35 13,35 12,37 C10,39 10,42 12,44 C14,46 17,46 19,45 C21,44 23,45 23,47 C23,49 20,51 17,51 C11,51 8,46 8,40 C8,34 11,28 15,24 C14,20 16,16 20,13 Z"
            fill="url(#goldGradient)"
          />
          {/* Face and Beard */}
          <path
            d="M32,26 C35,26 38,28 39,31 C40,34 39,37 37,39 C36,40 37,42 39,43 C42,44 45,46 45,49 C45,52 42,54 39,54 L34,54 C35,56 36,58 35,60 C34,62 31,61 30,59 C29,60 28,61 27,61 C26,61 25,59 25,57 C23,58 22,58 21,57 C20,55 21,52 22,51 C23,49 23,47 22,46 C19,44 18,39 19,34"
            fill="url(#goldGradient)"
          />
          {/* Speed / Hair lines */}
          <path d="M5,16 L12,16 M2,24 L10,24 M4,32 L9,32" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Text GO */}
        <text
          x="50"
          y="83"
          textAnchor="middle"
          fill="url(#goldGradient)"
          fontSize="22"
          fontWeight="900"
          fontFamily="sans-serif"
          letterSpacing="1"
        >
          GO
        </text>

        {/* Gold Gradient Definitions */}
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4ade80" /> {/* Light Green */}
            <stop offset="50%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
