"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, PhoneOff, User } from "lucide-react";
import { useRef } from "react";

interface Props {
  status: string;
  doctorName?: string;
  doctorSpecialty?: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreen: () => void;
  onEnd: () => void;
  onStart: () => void;
}

export function VideoPanel({
  status,
  doctorName,
  doctorSpecialty,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  onToggleVideo,
  onToggleAudio,
  onToggleScreen,
  onEnd,
  onStart,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const isActive = status === "active";
  const isWaiting = status === "waiting";
  const canStart = status === "scheduled" || status === "waiting";

  return (
    <Card className="overflow-hidden">
      <div className="relative bg-gray-900 aspect-video">
        {isActive || isWaiting ? (
          <>
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white font-semibold">Dr. {doctorName}</p>
              <p className="text-white/80 text-sm">{doctorSpecialty || "Medicina General"}</p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">{status === "completed" ? "Sesión finalizada" : "La sesión aún no ha comenzado"}</p>
            </div>
          </div>
        )}
      </div>

      {(isActive || isWaiting) && (
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-center gap-4">
            <Button variant={isVideoEnabled ? "secondary" : "destructive"} size="lg" onClick={onToggleVideo} className="rounded-full h-14 w-14">
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>
            <Button variant={isAudioEnabled ? "secondary" : "destructive"} size="lg" onClick={onToggleAudio} className="rounded-full h-14 w-14">
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>
            <Button variant={isScreenSharing ? "default" : "secondary"} size="lg" onClick={onToggleScreen} className="rounded-full h-14 w-14">
              {isScreenSharing ? <Monitor className="h-6 w-6" /> : <MonitorOff className="h-6 w-6" />}
            </Button>
            <Button variant="destructive" size="lg" onClick={onEnd} className="rounded-full h-14 w-14">
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}

      {canStart && (
        <div className="p-6 text-center">
          <Button onClick={onStart} size="lg" className="bg-green-600 hover:bg-green-700">
            <Video className="h-5 w-5 mr-2" />
            Iniciar Consulta
          </Button>
        </div>
      )}
    </Card>
  );
}

