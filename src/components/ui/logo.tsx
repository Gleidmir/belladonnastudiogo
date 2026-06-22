import { Sparkles } from "lucide-react";

export function BarberGoLogo({ className = "w-12 h-12", animate = true }: { className?: string; animate?: boolean }) {
  return (
    <div className={`relative flex items-center justify-center ${animate ? "animate-pulse" : ""} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(219,112,147,0.35)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Delicate pink / magenta background gradient */}
          <linearGradient id="pinkGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbcfe8" />
            <stop offset="50%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>

          {/* Premium gold gradient for the silhouette */}
          <linearGradient id="goldMetallic" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="30%" stopColor="#FFD54F" />
            <stop offset="70%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#FF8F00" />
          </linearGradient>

          {/* Rose Gold gradient for outer ring */}
          <linearGradient id="roseGoldMetallic" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF0F5" />
            <stop offset="50%" stopColor="#FFB6C1" />
            <stop offset="100%" stopColor="#DB7093" />
          </linearGradient>

          {/* Drop shadow filter */}
          <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.4" />
          </filter>

          {/* Clipping path */}
          <clipPath id="circleClip">
            <circle cx="50" cy="50" r="46" />
          </clipPath>
        </defs>

        {/* Circular Background */}
        <g clipPath="url(#circleClip)">
          {/* Subtle soft dark grey background to make gold pop */}
          <circle cx="50" cy="50" r="46" fill="#121214" />
          {/* Soft inner glow */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#pinkGradient)" strokeWidth="1" opacity="0.3" />
        </g>

        {/* Outer Ring Border */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="url(#roseGoldMetallic)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="44.5" fill="none" stroke="#000000" strokeWidth="0.5" opacity="0.3" />

        {/* Elegant Silhouette of Female Face and Flowing Hair */}
        <g filter="url(#shadowFilter)" transform="translate(1, 0)">
          {/* Profile Line (Face facing left) */}
          <path
            d="M34 26 
               C33 28, 30 30, 27 33
               C26 34, 25 35, 25 36
               C25 37, 27 37, 28 36
               C30 35, 33 33, 34 32
               C33 34, 30 38, 28 40
               C27 41, 26 42, 27 43
               C28 43, 30 42, 32 40
               C34 38, 36 36, 37 34
               C36 36, 33 42, 31 46
               C30 48, 29 49, 30 50
               C31 51, 33 50, 35 48
               C38 45, 41 41, 42 38
               C41 40, 37 47, 36 51
               C35 53, 34 54, 35 55
               C36 56, 38 54, 40 52
               C43 49, 46 44, 48 40
               C46 43, 42 51, 41 56
               C40 58, 39 60, 40 61
               C41 62, 43 60, 45 57
               C49 52, 53 45, 55 38
               C56 36, 56 33, 55 31
               C53 33, 50 38, 47 43
               C48 38, 51 33, 53 29
               C51 31, 47 37, 44 43
               C45 37, 47 31, 49 26
               C47 28, 43 35, 40 42
               C39 36, 40 30, 41 24
               C40 26, 37 32, 35 38
               C34 32, 34 26, 34 20"
            fill="url(#goldMetallic)"
          />

          {/* Main Hair Silhouette & Profile Base */}
          <path
            d="M33.5 25
               C30.5 28.5, 26 34.5, 25 38.5
               C24.3 41.3, 25.8 42.5, 27.5 42
               C29 41.5, 33.5 37.5, 35.5 34
               C34.5 37.5, 31 44.5, 29.5 48.5
               C28.8 50.4, 29.5 51.5, 31 51
               C33 50.3, 37.5 45.5, 39.5 41
               C38 44.5, 33.5 53.5, 32.5 57.5
               C31.8 60.3, 33 61.5, 35.5 60.5
               C38.5 59.3, 44.5 51.5, 47.5 45.5
               C47.8 47.5, 47.5 50.5, 46.5 54.5
               C45.2 59.8, 42.5 66.5, 38.5 73.5
               C36.5 77, 34.5 81, 38 78
               C42.5 74.2, 47.5 68.5, 52.5 60.5
               C57.5 52.5, 62.5 42.5, 64.5 32.5
               C65.5 27.5, 64.5 21.5, 60.5 17.5
               C55.5 12.5, 47.5 10.5, 41.5 12.5
               C35.5 14.5, 30.5 18.5, 26.5 23.5
               C23.5 27.5, 21.5 32.5, 23.5 31
               C26.5 28.8, 30.5 26.5, 33.5 25 Z"
            fill="url(#goldMetallic)"
          />

          {/* Dynamic Flowing Hair Strands (Right Side) */}
          <path
            d="M51 13
               C56 12, 63 15, 67 20
               C71 25, 73 31, 74 38
               C75 47, 72 55, 67 63
               C63 69, 58 74, 52 79
               C55 77, 60 72, 64 67
               C69 60, 72 52, 72 43
               C72 35, 69 28, 65 22
               C61 17, 56 14, 51 13 Z"
            fill="url(#goldMetallic)"
          />
          
          <path
            d="M56 17
               C62 17, 69 21, 73 27
               C77 33, 79 41, 78 49
               C77 57, 73 65, 68 71
               C62 78, 55 83, 48 87
               C52 84, 58 79, 63 73
               C67 67, 70 59, 70 51
               C70 43, 67 36, 63 30
               C59 24, 53 20, 48 18
               C51 17.5, 53.5 17.2, 56 17 Z"
            fill="url(#goldMetallic)"
          />

          <path
            d="M62 25
               C68 28, 73 34, 75 42
               C77 50, 75 58, 71 65
               C67 72, 60 78, 53 82
               C57 79, 63 74, 67 68
               C71 62, 72 55, 72 48
               C72 41, 69 35, 65 30
               C61 25, 56 22, 51 21
               C55 22, 59 23, 62 25 Z"
            fill="url(#goldMetallic)"
          />
        </g>

        {/* Text BellaDonna Studio GO at the bottom in a delicate gold/pink text */}
        <g filter="url(#shadowFilter)">
          <text
            x="50"
            y="88"
            textAnchor="middle"
            fill="url(#goldMetallic)"
            fontSize="10"
            fontWeight="900"
            fontFamily="'Outfit', 'Inter', sans-serif"
            letterSpacing="0.5"
          >
            BELLA DONNA
          </text>
        </g>
      </svg>
    </div>
  );
}
