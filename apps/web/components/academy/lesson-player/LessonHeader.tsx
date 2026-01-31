/**
 * @file LessonHeader.tsx
 * @description Cabecera con progreso y vidas para el Lesson Player
 */

'use client';

import React from 'react';
import { X, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface LessonHeaderProps {
    progress: number; // 0 to 100
    lives: number;
    onExit: () => void;
}

export const LessonHeader: React.FC<LessonHeaderProps> = ({ progress, lives, onExit }) => {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-black z-50 flex items-center px-6 gap-4 border-b border-white/5">
            <button
                onClick={onExit}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
                <X className="w-6 h-6 text-white/60" />
            </button>

            {/* Progress Bar Container */}
            <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            </div>

            <div className="flex items-center gap-1.5 ml-2">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                <span className="text-xl font-black text-rose-500">{lives}</span>
            </div>
        </header>
    );
};
