import React from 'react';

interface AosLogoSvgProps {
  className?: string;
  size?: number;
}

export const AosLogoSvg: React.FC<AosLogoSvgProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none`}
    >
      {/* Outer Circle Ring */}
      <circle
        cx="100"
        cy="100"
        r="90"
        stroke="#052f52"
        strokeWidth="15"
        fill="#FFFFFF"
      />

      {/* Outer decorative rim accent */}
      <circle
        cx="100"
        cy="100"
        r="96"
        stroke="#0d4775"
        strokeWidth="1.5"
        strokeDasharray="4 2"
        opacity="0.35"
      />

      {/* Shield Crest */}
      <path
        d="M58 64C82 62 92 50 100 44C108 50 118 62 142 64C143 104 135 136 100 162C65 136 57 104 58 64Z"
        fill="none"
        stroke="#052f52"
        strokeWidth="11"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Stylized Modern Letter 'A' */}
      <path
        d="M100 48L64 144H84L94 117H106L116 144H136L100 48ZM99 74L105 101H93L99 74Z"
        fill="#052f52"
        fillRule="evenodd"
      />

      {/* Mouse Cursor Pointer Arrow */}
      <path
        d="M103 94L144 142L128 144L141 164L132 170L119 150L107 160L103 94Z"
        fill="#052f52"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};
