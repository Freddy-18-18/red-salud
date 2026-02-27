"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@red-salud/core/utils";

interface FlipCardProps {
    front: React.ReactNode;
    back: React.ReactNode;
    className?: string;
}

export function FlipCard({ front, back, className }: FlipCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleFlip = () => {
        if (!isAnimating) {
            setIsFlipped(!isFlipped);
            setIsAnimating(true);
        }
    };

    return (
        <div
            className={cn("relative h-full w-full perspective-1000", className)}
            onClick={handleFlip}
        >
            <motion.div
                className="relative h-full w-full cursor-pointer"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                onAnimationComplete={() => setIsAnimating(false)}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Front Face - Relative to set height */}
                <div
                    className="relative h-full w-full"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    {front}
                </div>

                {/* Back Face - Absolute so it flips behind */}
                <div
                    className="absolute top-0 left-0 h-full w-full"
                    style={{
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden"
                    }}
                >
                    {back}
                </div>
            </motion.div>
        </div>
    );
}
