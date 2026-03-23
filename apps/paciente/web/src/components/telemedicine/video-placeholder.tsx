"use client";

import { Camera, UserCircle, Wifi, WifiOff } from "lucide-react";

interface VideoPlaceholderProps {
  label?: string;
  isSmall?: boolean;
  showAvatar?: boolean;
  avatarUrl?: string;
  initials?: string;
  connectionQuality?: "good" | "fair" | "poor";
  isScreenSharing?: boolean;
}

export function VideoPlaceholder({
  label,
  isSmall = false,
  showAvatar = true,
  avatarUrl,
  initials,
  connectionQuality,
  isScreenSharing = false,
}: VideoPlaceholderProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${
        isSmall ? "w-40 h-28 sm:w-48 sm:h-36" : "w-full h-full"
      }`}
    >
      {/* Gradient background simulating video feed */}
      <div
        className={`absolute inset-0 ${
          isSmall
            ? "bg-gradient-to-br from-gray-800 to-gray-900"
            : "bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900"
        }`}
      />

      {/* Animated subtle pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center h-full gap-2">
        {showAvatar && (
          <>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className={`rounded-full object-cover ${
                  isSmall ? "w-12 h-12" : "w-20 h-20"
                }`}
              />
            ) : initials ? (
              <div
                className={`flex items-center justify-center rounded-full bg-gray-600 text-white font-semibold ${
                  isSmall ? "w-12 h-12 text-sm" : "w-20 h-20 text-2xl"
                }`}
              >
                {initials}
              </div>
            ) : (
              <UserCircle
                className={`text-gray-500 ${
                  isSmall ? "h-12 w-12" : "h-20 w-20"
                }`}
              />
            )}
          </>
        )}

        {!showAvatar && (
          <Camera
            className={`text-gray-500 ${isSmall ? "h-8 w-8" : "h-16 w-16"}`}
          />
        )}

        {label && (
          <p
            className={`text-gray-400 font-medium ${
              isSmall ? "text-xs" : "text-sm"
            }`}
          >
            {label}
          </p>
        )}
      </div>

      {/* Screen sharing notification */}
      {isScreenSharing && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-blue-500/80 rounded-md backdrop-blur-sm">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-xs text-white font-medium">
            Compartiendo pantalla
          </span>
        </div>
      )}

      {/* Connection quality indicator */}
      {connectionQuality && (
        <div className="absolute top-3 right-3">
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md backdrop-blur-sm ${
              connectionQuality === "good"
                ? "bg-emerald-500/20 text-emerald-400"
                : connectionQuality === "fair"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-red-500/20 text-red-400"
            }`}
          >
            {connectionQuality === "poor" ? (
              <WifiOff className="h-3 w-3" />
            ) : (
              <Wifi className="h-3 w-3" />
            )}
            <span className="text-[10px] font-medium">
              {connectionQuality === "good"
                ? "Buena"
                : connectionQuality === "fair"
                  ? "Regular"
                  : "Inestable"}
            </span>
          </div>
        </div>
      )}

      {/* Name label at bottom */}
      {label && !isSmall && (
        <div className="absolute bottom-3 left-3">
          <div className="px-2 py-1 bg-gray-900/60 rounded-md backdrop-blur-sm">
            <span className="text-xs text-white font-medium">{label}</span>
          </div>
        </div>
      )}
    </div>
  );
}
