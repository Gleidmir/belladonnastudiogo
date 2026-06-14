export function BarberGoLogo({ className = "w-12 h-12", animate = true }: { className?: string; animate?: boolean }) {
  return (
    <div className={`relative flex items-center justify-center ${animate ? "animate-pulse" : ""} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Definition of Gradients, Filters, and Stars */}
        <defs>
          {/* Green flag gradient */}
          <linearGradient id="goiasGreen" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#007F3D" />
            <stop offset="100%" stopColor="#005C2B" />
          </linearGradient>

          {/* Yellow flag gradient */}
          <linearGradient id="goiasYellow" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD200" />
            <stop offset="100%" stopColor="#E5BD00" />
          </linearGradient>

          {/* Blue canton gradient */}
          <linearGradient id="goiasBlue" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#004B87" />
            <stop offset="100%" stopColor="#003366" />
          </linearGradient>

          {/* Premium gold gradient for tools and text */}
          <linearGradient id="goldMetallic" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="50%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#FF8F00" />
          </linearGradient>

          {/* Gold gradient for outer ring */}
          <linearGradient id="goldRing" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="50%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#FFB300" />
          </linearGradient>

          {/* Drop shadow filter to make the tools pop from the flag background */}
          <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.95" />
          </filter>

          {/* Clipping path to keep all flag elements inside the circle */}
          <clipPath id="circleClip">
            <circle cx="50" cy="50" r="46" />
          </clipPath>

          {/* Star definition for the Cruzeiro do Sul */}
          <g id="cruzeiroStar">
            <polygon 
              points="0,-3.5 1.0,-1.0 3.5,-0.8 1.6,1.0 2.2,3.5 0,2.2 -2.2,3.5 -1.6,1.0 -3.5,-0.8 -1.0,-1.0" 
              fill="#FFFFFF" 
            />
          </g>
        </defs>

        {/* Circular Flag Base */}
        <g clipPath="url(#circleClip)">
          {/* Green Background */}
          <rect x="0" y="0" width="100" height="100" fill="url(#goiasGreen)" />

          {/* 4 Yellow Stripes (representing the 8 stripes when alternating with green) */}
          {/* Stripe height is 12.5 (100 / 8) */}
          <rect x="0" y="12.5" width="100" height="12.5" fill="url(#goiasYellow)" />
          <rect x="0" y="37.5" width="100" height="12.5" fill="url(#goiasYellow)" />
          <rect x="0" y="62.5" width="100" height="12.5" fill="url(#goiasYellow)" />
          <rect x="0" y="87.5" width="100" height="12.5" fill="url(#goiasYellow)" />

          {/* Blue Canton (top left quadrant) */}
          <rect x="0" y="0" width="50" height="50" fill="url(#goiasBlue)" />

          {/* Cruzeiro do Sul Stars */}
          <use href="#cruzeiroStar" x="25" y="12" />
          <use href="#cruzeiroStar" x="25" y="38" />
          <use href="#cruzeiroStar" x="13" y="25" />
          <use href="#cruzeiroStar" x="37" y="25" />
          <use href="#cruzeiroStar" x="31" y="31" transform="scale(0.65)" transform-origin="31 31" />
        </g>

        {/* Golden Metallic Ring Border */}
        <circle cx="50" cy="50" r="46.5" fill="none" stroke="url(#goldRing)" strokeWidth="3" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#000000" strokeWidth="0.5" opacity="0.4" />

        {/* Crossed Scissors and Comb (emblem look) */}
        <g filter="url(#shadowFilter)">
          
          {/* 1. The Comb (running diagonally from bottom-left to top-right) */}
          <g transform="translate(50, 52) rotate(-35)">
            {/* Comb Spine */}
            <rect x="-24" y="-4" width="48" height="3" rx="1.5" fill="url(#goldMetallic)" />
            {/* Comb Teeth */}
            <path 
              d="M -22,-1 L -22,7 M -20,-1 L -20,7 M -18,-1 L -18,7 M -16,-1 L -16,7 M -14,-1 L -14,7 M -12,-1 L -12,7 M -10,-1 L -10,7 M -8,-1 L -8,7 M -6,-1 L -6,7 M -4,-1 L -4,7 M -2,-1 L -2,7 M 0,-1 L 0,7 M 2,-1 L 2,7 M 4,-1 L 4,7 M 6,-1 L 6,7 M 8,-1 L 8,7 M 10,-1 L 10,7 M 12,-1 L 12,7 M 14,-1 L 14,7 M 16,-1 L 16,7 M 18,-1 L 18,7 M 20,-1 L 20,7 M 22,-1 L 22,7" 
              stroke="url(#goldMetallic)" 
              strokeWidth="1.2" 
              strokeLinecap="round" 
            />
          </g>

          {/* 2. The Scissors (running diagonally from top-left to bottom-right, overlaying the comb) */}
          <g transform="translate(50, 52) rotate(35)">
            {/* Rings/Handles */}
            <circle cx="-21" cy="-5.5" r="4.5" fill="none" stroke="url(#goldMetallic)" strokeWidth="2.5" />
            <circle cx="-21" cy="5.5" r="4.5" fill="none" stroke="url(#goldMetallic)" strokeWidth="2.5" />
            
            {/* Shanks */}
            <path d="M -16.5,-4.5 L 0,-0.5 M -16.5,4.5 L 0,0.5" stroke="url(#goldMetallic)" strokeWidth="2.2" strokeLinecap="round" />
            
            {/* Blades (slightly open for a sharp, clean look) */}
            <path d="M 0,-0.5 L 23,-4.5 L 21,-1.5 Z" fill="url(#goldMetallic)" />
            <path d="M 0,0.5 L 23,4.5 L 21,1.5 Z" fill="url(#goldMetallic)" />
            
            {/* Center Pivot Screw */}
            <circle cx="0" cy="0" r="1.5" fill="#1e293b" />
          </g>
        </g>

        {/* Text GO at the bottom inside a shiny background banner */}
        <g filter="url(#shadowFilter)">
          <text
            x="50"
            y="88"
            textAnchor="middle"
            fill="url(#goldMetallic)"
            fontSize="15"
            fontWeight="900"
            fontFamily="sans-serif"
            letterSpacing="1"
          >
            GO
          </text>
        </g>
      </svg>
    </div>
  );
}
