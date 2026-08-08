import { SVGAttributes } from 'react';

export default function AppLogoIcon(
    props: SVGAttributes<SVGSVGElement>,
) {
    return (
        <svg
            {...props}
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
        >
            {/* C exterior */}
            <path
                d="
                    M38 12
                    C34.5 7.8 29.4 5.5 24 5.5
                    C13.8 5.5 5.5 13.8 5.5 24
                    C5.5 34.2 13.8 42.5 24 42.5
                    C29.4 42.5 34.5 40.2 38 36
                "
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
            />

            {/* I / núcleo CIVAN */}
            <path
                d="M25 15V33"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
            />

            {/* Punto superior */}
            <circle
                cx="25"
                cy="10"
                r="3"
                fill="currentColor"
            />
        </svg>
    );
}