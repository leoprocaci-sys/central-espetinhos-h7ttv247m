import React from 'react'

export const SkewerIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Skewer stick line */}
      <line x1="3" y1="21" x2="21" y2="3" stroke="#C43A25" strokeWidth="2.2" />
      {/* Meat pieces along the skewer */}
      <rect
        x="5.5"
        y="14.5"
        width="4.5"
        height="4.5"
        rx="1.2"
        transform="rotate(-45 7.75 16.75)"
        fill="#F29F05"
        stroke="#C43A25"
        strokeWidth="1.5"
      />
      <rect
        x="9.5"
        y="10.5"
        width="4.5"
        height="4.5"
        rx="1.2"
        transform="rotate(-45 11.75 12.75)"
        fill="#C43A25"
        stroke="#8E2312"
        strokeWidth="1.5"
      />
      <rect
        x="13.5"
        y="6.5"
        width="4.5"
        height="4.5"
        rx="1.2"
        transform="rotate(-45 15.75 8.75)"
        fill="#F29F05"
        stroke="#C43A25"
        strokeWidth="1.5"
      />
    </svg>
  )
}
