"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  useSession,
  useActiveSession,
  useSessionParticipants,
  useSessionChat,
} from "@/hooks/use-telemedicine";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, FileText } from "lucide-react";
import { SessionHeader } from "@/components/dashboard/paciente/telemedicina/session/session-header";
import { VideoPanel } from "@/components/dashboard/paciente/telemedicina/session/video-panel";
import { InfoCard } from "@/components/dashboard/paciente/telemedicina/session/info-card";
import { ChatPanel } from "@/components/dashboard/paciente/telemedicina/session/chat-panel";
import { NotesPanel } from "@/components/dashboard/paciente/telemedicina/session/notes-panel";
import { ParticipantsPanel } from "@/components/dashboard/paciente/telemedicina/session/participants-panel";

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [userId, setUserId] = useState<string | undefined>();
  const [userName, setUserName] = useState<string>("");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");

  const { session, loading, refreshSession } = useSession(sessionId);
  const { start, end, update } = useActiveSession(sessionId);
  const { participants, join, leave } = useSessionParticipants(sessionId);
  const { messages, send, markAsRead, refreshMessages } = useSessionChat(sessionId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Obtener nombre del usuario
        const { data: profile } = await supabase
          .from("profiles")
          .select("nombre_completo")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setUserName(profile.nombre_completo);
        }
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simular acceso a cámara y micrófono
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    if (session?.status === "active" || session?.status === "waiting") {
      initMedia();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [session?.status]);

  const handleStartSession = async () => {
    if (!userId) return;

    // Unirse como participante
    await join(userId, {
      session_id: sessionId,
      role: "patient",
      video_enabled: isVideoEnabled,
      audio_enabled: isAudioEnabled,
    });

    // Iniciar sesión
    await start();
    await refreshSession();
  };

  const handleEndSession = async () => {
    await end(sessionNotes);
    await refreshSession();
    router.push("/dashboard/paciente/telemedicina");
  };

  const handleSendMessage = async () => {
    if (!userId || !messageText.trim()) return;

    await send(userId, {
      session_id: sessionId,
      message: messageText,
      message_type: "text",
    });

    setMessageText("");
    await refreshMessages();
  };

  const toggleVideo = async () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled;
      });
    }
  };

  const toggleAudio = async () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioEnabled;
      });
    }
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // Aquí iría la lógica real de compartir pantalla
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Sesión no encontrada</p>
            <Button onClick={() => router.push("/dashboard/paciente/telemedicina")}>
              Volver a Telemedicina
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive = session.status === "active";
  const isWaiting = session.status === "waiting";
  const canStart = session.status === "scheduled" || session.status === "waiting";

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <SessionHeader status={session.status} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <VideoPanel
              status={session.status}
              doctorName={session.doctor?.nombre_completo}
              doctorSpecialty={session.doctor?.specialty}
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              isScreenSharing={isScreenSharing}
              onToggleVideo={toggleVideo}
              onToggleAudio={toggleAudio}
              onToggleScreen={toggleScreenShare}
              onEnd={handleEndSession}
              onStart={handleStartSession}
            />

            <InfoCard
              scheduled_start_time={session.scheduled_start_time}
              reason={session.appointment?.reason}
              duration_minutes={session.duration_minutes}
            />
          </div>

          {/* Panel lateral */}
          <div className="space-y-4">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <FileText className="h-4 w-4 mr-2" />
                  Notas
                </TabsTrigger>
              </TabsList>

              <ChatPanel
                messages={messages as any}
                userId={userId}
                messageText={messageText}
                onMessageTextChange={setMessageText}
                onSend={handleSendMessage}
              />

              {/* Notas */}
              <NotesPanel notes={sessionNotes} onNotesChange={setSessionNotes} />
            </Tabs>

            <ParticipantsPanel participants={participants as any} userName={userName} doctorName={session.doctor?.nombre_completo} />
          </div>
        </div>
      </div>
    </div>
  );
}
