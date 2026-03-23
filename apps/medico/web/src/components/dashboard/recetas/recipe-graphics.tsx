import React from 'react';

// ==============================================================================
// WATERMARKS
// ==============================================================================

export const WatermarkCaduceus = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg viewBox="0 0 100 100" className={className} style={style} fill="currentColor">
        <path d="M50 5 C52 5 54 7 54 10 V15 H56 C65 15 72 22 72 31 C72 37 69 42 64 45 L64 85 C64 88 58 88 58 85 V20 H54 V90 C54 95 46 95 46 90 V20 H42 V85 C42 88 36 88 36 85 L36 45 C31 42 28 37 28 31 C28 22 35 15 44 15 H46 V10 C46 7 48 5 50 5 Z M44 20 H36 C32 20 29 23 29 27 C29 31 32 34 36 34 H44 V20 Z M56 20 V34 H64 C68 34 71 31 71 27 C71 23 68 20 64 20 H56 Z" opacity="0.6" />
        <path d="M50 0 L55 8 L45 8 Z" /> {/* Wings simplified */}
    </svg>
);

export const WatermarkHeartbeat = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg viewBox="0 0 200 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 50 H40 L55 10 L75 90 L90 50 H190" />
    </svg>
);

export const WatermarkCross = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg viewBox="0 0 100 100" className={className} style={style} fill="currentColor">
        <path d="M35 10 H65 V35 H90 V65 H65 V90 H35 V65 H10 V35 H35 V10 Z" opacity="0.5" />
        <path d="M40 15 H60 V40 H85 V60 H60 V85 H40 V60 H15 V40 H40 V15 Z" fill="none" stroke="currentColor" strokeWidth="2" opacity="1" />
    </svg>
);


// ==============================================================================
// TEMPLATES
// ==============================================================================

// Interface for Template Components
interface TemplateProps {
    color?: string;
    className?: string; // For absolute positioning
}

export function TemplateModern({ color = "#000", className }: TemplateProps) {
    // A clean, minimal frame that wraps the top and sides, but leaves the footer open for address info.
    // Also adds a subtle accent bar on the left.
    return (
        <svg viewBox="0 0 816 1056" className={className} preserveAspectRatio="none">
            {/* Main top/side border - stops before footer */}
            <path
                d="M 40 920 L 40 40 L 776 40 L 776 920"
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
            />
            {/* Decorative minimalist accent (e.g. top left corner thicker) */}
            <path d="M 40 140 L 40 40 L 140 40" fill="none" stroke={color} strokeWidth="6" strokeLinecap="square" />

            {/* Optional: A fine separator line for the footer, but well above the text */}
            <line x1="100" y1="920" x2="716" y2="920" stroke={color} strokeWidth="1" opacity="0.5" strokeDasharray="4 4" />
        </svg>
    );
}

export const TemplateGeometric: React.FC<TemplateProps> = ({ color, className }) => (
    <svg className={className} width="100%" height="100%" viewBox="0 0 816 1056" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Top Left Corner */}
        <path d="M20 150 V20 H150" stroke={color} strokeWidth="4" />
        <path d="M20 160 L160 20" stroke={color} strokeWidth="1" />
        <path d="M30 160 L160 30" stroke={color} strokeWidth="1" />

        {/* Bottom Right Corner */}
        <path d="M796 906 V1036 H666" stroke={color} strokeWidth="4" />
        <path d="M796 896 L656 1036" stroke={color} strokeWidth="1" />
        <path d="M786 896 L656 1026" stroke={color} strokeWidth="1" />

        {/* Content Divider */}
        <line x1="50" y1="130" x2="766" y2="130" stroke={color} strokeWidth="2" strokeDasharray="5 5" />
    </svg>
);

export const TemplateElegant: React.FC<TemplateProps> = ({ color, className }) => (
    <svg className={className} width="100%" height="100%" viewBox="0 0 816 1056" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="30" width="756" height="996" stroke={color} strokeWidth="1" />
        <rect x="35" y="35" width="746" height="986" stroke={color} strokeWidth="3" />
        {/* Corners */}
        <path d="M35 85 V35 H85" stroke={color} strokeWidth="8" />
        <path d="M781 85 V35 H731" stroke={color} strokeWidth="8" />
        <path d="M35 971 V1021 H85" stroke={color} strokeWidth="8" />
        <path d="M781 971 V1021 H731" stroke={color} strokeWidth="8" />

        <circle cx="408" cy="80" r="30" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
);

export const TemplateClinical: React.FC<TemplateProps> = ({ color, className }) => (
    <svg className={className} width="100%" height="100%" viewBox="0 0 816 1056" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Top Header Block */}
        <rect x="0" y="0" width="816" height="120" fill={color} fillOpacity="0.1" />
        <rect x="0" y="0" width="10" height="1056" fill={color} fillOpacity="0.8" />

        {/* Cross Icon Top Right */}
        <path d="M750 40 H770 V60 H790 V80 H770 V100 H750 V80 H730 V60 H750 V40 Z" fill={color} />

        {/* Bottom Footer Block */}
        <rect x="0" y="980" width="816" height="76" fill={color} fillOpacity="0.1" />
    </svg>
);

export const TemplateWaves: React.FC<TemplateProps> = ({ color, className }) => (
    <svg className={className} width="100%" height="100%" viewBox="0 0 816 1056" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 H816 V100 C600 150 400 50 0 100 V0 Z" fill={color} fillOpacity="0.15" />
        <path d="M0 0 H816 V80 C600 130 400 30 0 80 V0 Z" fill={color} fillOpacity="0.3" />

        <path d="M0 1056 H816 V956 C600 906 400 1006 0 956 V1056 Z" fill={color} fillOpacity="0.15" />
    </svg>
);

export const TemplateTech: React.FC<TemplateProps> = ({ color, className }) => (
    <svg className={className} width="100%" height="100%" viewBox="0 0 816 1056" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Corner Circuits */}
        <polyline points="50,20 20,20 20,50" stroke={color} strokeWidth="2" fill="none" />
        <circle cx="20" cy="20" r="3" fill={color} />
        <line x1="50" y1="20" x2="100" y2="20" stroke={color} strokeWidth="1" />
        <circle cx="100" cy="20" r="2" fill={color} />

        <polyline points="766,20 796,20 796,50" stroke={color} strokeWidth="2" fill="none" />
        <line x1="766" y1="20" x2="700" y2="20" stroke={color} strokeWidth="1" />
        <circle cx="700" cy="20" r="2" fill={color} />

        {/* Side Lines */}
        <line x1="20" y1="100" x2="20" y2="900" stroke={color} strokeWidth="1" strokeDasharray="4 4" />
        <line x1="796" y1="100" x2="796" y2="900" stroke={color} strokeWidth="1" strokeDasharray="4 4" />

        {/* Bottom */}
        <line x1="100" y1="1000" x2="716" y2="1000" stroke={color} strokeWidth="1" />
        <rect x="403" y="995" width="10" height="10" fill={color} />
    </svg>
);
