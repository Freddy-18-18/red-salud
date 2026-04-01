"use client";

import { ArrowLeft, Video, AlertTriangle, Monitor } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";

import { CallChat } from "@/components/telemedicine/call-chat";
import { CallControls } from "@/components/telemedicine/call-controls";
import { VideoPlaceholder } from "@/components/telemedicine/video-placeholder";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTelemedicineSession,
  useMediaDevices,
} from "@/hooks/use-telemedicine";
import { updateSessionStatus } from "@/lib/services/telemedicine-service";
import { supabase } from "@/lib/supabase/client";


export default function VideoCallPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const { session, loading, error } = useTelemedicineSession(sessionId);
  const {
    stream,
    cameraEnabled,
    micEnabled,
    requestAccess,
    toggleCamera,
    toggleMic,
    stopAll,
  } = useMediaDevices();

  const [userId, setUserId] = useState<string>();
  const [chatOpen, setChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<
    "good" | "fair" | "poor"
  >("good");

  const containerRef = useRef<HTMLDivElement>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const [selfVideoPosition, setSelfVideoPosition] = useState({
    x: 16,
    y: 16,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    loadUser();
  }, []);

  // Request media access
  useEffect(() => {
    requestAccess();
  }, [requestAccess]);

  // Attach self stream to video
  useEffect(() => {
    if (selfVideoRef.current && stream) {
      selfVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Simulate connection quality changes
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.9) setConnectionQuality("poor");
      else if (rand > 0.7) setConnectionQuality("fair");
      else setConnectionQuality("good");
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Redirect to summary when session completes
  useEffect(() => {
    if (session?.status === "completed") {
      stopAll();
      router.push(`/dashboard/telemedicina/resumen/${sessionId}`);
    }
  }, [session?.status, sessionId, router, stopAll]);

  const handleEndCall = async () => {
    stopAll();
    await updateSessionStatus(sessionId, "completed");
    router.push(`/dashboard/telemedicina/resumen/${sessionId}`);
  };

  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Self-view drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragOffset.current = {
      x: clientX - selfVideoPosition.x,
      y: clientY - selfVideoPosition.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY =
        "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      setSelfVideoPosition({
        x: clientX - dragOffset.current.x,
        y: clientY - dragOffset.current.y,
      });
    };

    const handleEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[60vh] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          No se pudo cargar la consulta
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Verifica tu conexion e intenta de nuevo
        </p>
        <a
          href="/dashboard/telemedicina"
          className="inline-flex items-center gap-2 text-sm text-emerald-600 font-medium hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a telemedicina
        </a>
      </div>
    );
  }

  const doctorName = session.doctor?.full_name || "Doctor";
  const doctorInitials =
    doctorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DR";

  return (
    <div
      ref={containerRef}
      className={`flex flex-col ${isFullscreen ? "h-screen bg-gray-950" : "h-[calc(100vh-8rem)]"}`}
    >
      {/* Top Bar - Only shown when not fullscreen */}
      {!isFullscreen && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-emerald-500" />
            <h1 className="text-lg font-semibold text-gray-900">
              Consulta con Dr. {doctorName}
            </h1>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex gap-0 overflow-hidden rounded-xl">
        {/* Video Area */}
        <div className="flex-1 relative bg-gray-950 rounded-xl overflow-hidden">
          {/* Doctor's Video (Placeholder) */}
          <VideoPlaceholder
            label={`Dr. ${doctorName}`}
            avatarUrl={session.doctor?.avatar_url}
            initials={doctorInitials}
            connectionQuality={connectionQuality}
          />

          {/* Self-view (small, draggable) */}
          <div
            className="absolute z-10 shadow-2xl rounded-xl overflow-hidden cursor-move"
            style={{
              right: `${selfVideoPosition.x}px`,
              bottom: `${selfVideoPosition.y + 80}px`,
            }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            {stream && cameraEnabled ? (
              <video
                ref={selfVideoRef}
                autoPlay
                playsInline
                muted
                className="w-40 h-28 sm:w-48 sm:h-36 object-cover rounded-xl"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : (
              <VideoPlaceholder isSmall showAvatar={false} label="Tu" />
            )}
            {!cameraEnabled && stream && (
              <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center rounded-xl">
                <p className="text-xs text-gray-400">Camara apagada</p>
              </div>
            )}
          </div>

          {/* Screen sharing notification */}
          {session.status === "in_progress" && (
            <div className="absolute top-3 left-3 hidden">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/80 rounded-lg backdrop-blur-sm">
                <Monitor className="h-4 w-4 text-white" />
                <span className="text-sm text-white font-medium">
                  Doctor esta compartiendo pantalla
                </span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <CallControls
              cameraEnabled={cameraEnabled}
              micEnabled={micEnabled}
              chatOpen={chatOpen}
              startedAt={session.started_at}
              onToggleCamera={toggleCamera}
              onToggleMic={toggleMic}
              onToggleChat={() => setChatOpen(!chatOpen)}
              onEndCall={handleEndCall}
              onToggleFullscreen={handleToggleFullscreen}
              isFullscreen={isFullscreen}
            />
          </div>
        </div>

        {/* Chat Panel */}
        {chatOpen && userId && (
          <div className="w-80 hidden sm:block">
            <CallChat
              sessionId={sessionId}
              currentUserId={userId}
              onClose={() => setChatOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Mobile Chat Panel (overlay) */}
      {chatOpen && userId && (
        <div className="fixed inset-0 z-50 bg-white sm:hidden flex flex-col">
          <CallChat
            sessionId={sessionId}
            currentUserId={userId}
            onClose={() => setChatOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
