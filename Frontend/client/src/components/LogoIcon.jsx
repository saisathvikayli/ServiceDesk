import React from 'react'

export default function LogoIcon({ size = 28 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M15 26 L40 14 L65 26 L40 38 Z" fill="#f2c14e" />
            <path
                d="M15 38 L40 50 L65 38"
                stroke="#ffffff"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M15 50 L40 62 L65 50"
                stroke="#ffffff"
                strokeWidth="5"
                opacity="0.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}