"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeInProps extends HTMLMotionProps<"div"> {
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
    className?: string;
    children: React.ReactNode;
}

export function FadeIn({
    delay = 0,
    direction = "up",
    className,
    children,
    ...props
}: FadeInProps) {
    const directionOffset =
        direction === "up"
            ? { y: 40 }
            : direction === "down"
                ? { y: -40 }
                : direction === "left"
                    ? { x: 40 }
                    : { x: -40 };

    return (
        <motion.div
            initial={{
                opacity: 0,
                ...directionOffset,
            }}
            whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
            }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.7,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    );
}
