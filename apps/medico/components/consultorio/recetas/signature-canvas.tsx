
"use client";

import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { cn } from "@red-salud/core/utils";

interface SignatureCanvasProps {
    className?: string;
    onEnd?: () => void;
}

export interface SignatureCanvasRef {
    clear: () => void;
    isEmpty: () => boolean;
    toDataURL: () => string;
}

const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
    ({ className, onEnd }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const [isDrawing, setIsDrawing] = useState(false);

        // Values for drawing style
        const strokeColor = "#000000";
        const strokeWidth = 2;

        useImperativeHandle(ref, () => ({
            clear: () => {
                const canvas = canvasRef.current;
                if (canvas) {
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
            },
            isEmpty: () => {
                const canvas = canvasRef.current;
                if (!canvas) return true;
                const ctx = canvas.getContext("2d");
                if (!ctx) return true;

                const pixelBuffer = new Uint32Array(
                    ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
                );

                return !pixelBuffer.some((color) => color !== 0);
            },
            toDataURL: () => {
                const canvas = canvasRef.current;
                return canvas ? canvas.toDataURL("image/png") : "";
            }
        }));

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            // Set canvas size to match parent
            const resizeCanvas = () => {
                const parent = canvas.parentElement;
                if (parent) {
                    canvas.width = parent.clientWidth;
                    canvas.height = parent.clientHeight;
                    // Re-context setup after resize if needed, but clearing is standard behavior on resize
                }
            };

            resizeCanvas();
            window.addEventListener("resize", resizeCanvas);

            return () => {
                window.removeEventListener("resize", resizeCanvas);
            };
        }, []);

        // Drawing functions
        const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
            setIsDrawing(true);
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const { x, y } = getCoordinates(e, canvas);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = "round";
            ctx.strokeStyle = strokeColor;
        };

        const draw = (e: React.MouseEvent | React.TouchEvent) => {
            if (!isDrawing) return;
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const { x, y } = getCoordinates(e, canvas);
            ctx.lineTo(x, y);
            ctx.stroke();
        };

        const stopDrawing = () => {
            if (isDrawing) {
                setIsDrawing(false);
                if (onEnd) onEnd();
            }
        };

        const getCoordinates = (
            e: React.MouseEvent | React.TouchEvent,
            canvas: HTMLCanvasElement
        ) => {
            const rect = canvas.getBoundingClientRect();
            let clientX = 0;
            let clientY = 0;

            if ("touches" in e) {
                const touchEvent = e as unknown as React.TouchEvent;
                if (touchEvent.touches && touchEvent.touches.length > 0) {
                    const touch = touchEvent.touches[0];
                    if (touch) {
                        clientX = touch.clientX;
                        clientY = touch.clientY;
                    }
                } else {
                    return { x: 0, y: 0 };
                }
            } else {
                const mouseEvent = e as React.MouseEvent;
                clientX = mouseEvent.clientX;
                clientY = mouseEvent.clientY;
            }

            return {
                x: clientX - rect.left,
                y: clientY - rect.top,
            };
        };

        return (
            <canvas
                ref={canvasRef}
                className={cn("w-full h-full touch-none cursor-crosshair", className)}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
        );
    }
);

SignatureCanvas.displayName = "SignatureCanvas";

export { SignatureCanvas };
