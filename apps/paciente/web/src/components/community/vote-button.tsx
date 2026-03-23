"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@red-salud/core/utils";
import type { VoteType } from "@/lib/services/community-service";

interface VoteButtonProps {
  count: number;
  currentVote?: VoteType | null;
  onVote: (type: VoteType) => void;
  disabled?: boolean;
  vertical?: boolean;
}

export function VoteButton({
  count,
  currentVote,
  onVote,
  disabled = false,
  vertical = true,
}: VoteButtonProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5",
        vertical ? "flex-col" : "flex-row"
      )}
    >
      <button
        type="button"
        onClick={() => onVote("up")}
        disabled={disabled}
        className={cn(
          "p-1 rounded-md transition-colors",
          currentVote === "up"
            ? "text-emerald-600 bg-emerald-50"
            : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-label="Votar a favor"
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      <span
        className={cn(
          "text-sm font-semibold tabular-nums min-w-[1.5rem] text-center",
          currentVote === "up"
            ? "text-emerald-600"
            : currentVote === "down"
              ? "text-red-500"
              : "text-gray-600"
        )}
      >
        {count}
      </span>

      <button
        type="button"
        onClick={() => onVote("down")}
        disabled={disabled}
        className={cn(
          "p-1 rounded-md transition-colors",
          currentVote === "down"
            ? "text-red-500 bg-red-50"
            : "text-gray-400 hover:text-red-500 hover:bg-red-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-label="Votar en contra"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}
