"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  UserPlus, 
  Mail, 
  Loader2, 
  Trash2, 
  Shield, 
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Secretary {
  id: string;
  email: string;
  nombre_completo: string;
  avatar_url: string | null;
  status: "pending" | "active" | "inactive";
  created_at: string;
}

export function SecretariesSection() {
  const [loading, setLoading] = useState(true);
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadSecretaries();
  }, []);

  const loadSecretaries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("doctor_secretaries")
        .select(`
          id,
          secretary_id,
          status,
          created_at,
          secretary:profiles!doctor_secretaries_secretary_id_fkey(
            id,
            email,
            nombre_completo,
            avatar_url
          )
        `)
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedSecretaries: Secretary[] = data.map((item: any) => ({
          id: item.id,
          email: item.secretary?.email || "",
          nombre_completo: item.secretary?.nombre_completo || "Sin nombre",
          avatar_url: item.secretary?.avatar_url || null,
          status: item.status,
          created_at: item.created_at,
        }));
        setSecretaries(formattedSecretaries);
      }
    } catch (error) {
      console.error("Error loading secretaries:", error);
      alert("Error al cargar secretarias");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      alert("Por favor ingresa un correo electrónico");
      return;
    }

    setInviting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar si el usuario existe
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("email", inviteEmail.trim())
        .single();

      if (!existingUser) {
        alert("No existe un usuario con ese correo electrónico");
        return;
      }

      if (existingUser.role !== "secretaria") {
        alert("El usuario debe tener rol de secretaria");
        return;
      }

      // Verificar si ya está invitada
      const { data: existing } = await supabase
        .from("doctor_secretaries")
        .select("id")
        .eq("doctor_id", user.id)
        .eq("secretary_id", existingUser.id)
        .single();

      if (existing) {
        alert("Esta secretaria ya está en tu lista");
        return;
      }

      // Crear la relación
      const { error } = await supabase
        .from("doctor_secretaries")
        .insert({
          doctor_id: user.id,
          secretary_id: existingUser.id,
          status: "active",
        });

      if (error) throw error;

      alert("Secretaria agregada correctamente");
      setInviteEmail("");
      loadSecretaries();
    } catch (error) {
      console.error("Error inviting secretary:", error);
      alert("Error al agregar secretaria");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (secretaryId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta secretaria?")) return;

    try {
      const { error } = await supabase
        .from("doctor_secretaries")
        .delete()
        .eq("id", secretaryId);

      if (error) throw error;

      alert("Secretaria eliminada correctamente");
      loadSecretaries();
    } catch (error) {
      console.error("Error removing secretary:", error);
      alert("Error al eliminar secretaria");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { label: "Activa", className: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle2 },
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: Clock },
      inactive: { label: "Inactiva", className: "bg-gray-100 text-gray-800 border-gray-300", icon: XCircle },
    };
    const variant = variants[status as keyof typeof variants] || variants.pending;
    const Icon = variant.icon;
    
    return (
      <Badge variant="outline" className={variant.className}>
        <Icon className="h-3 w-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invite Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <UserPlus className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Agregar Secretaria
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Ingresa el correo electrónico de la secretaria que deseas agregar a tu equipo
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="secretaria@ejemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleInvite()}
                />
              </div>
              <Button onClick={handleInvite} disabled={inviting}>
                {inviting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Agregando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Agregar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Secretaries List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Secretarias ({secretaries.length})
          </h3>
        </div>

        {secretaries.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Shield className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No tienes secretarias agregadas</p>
            <p className="text-sm text-gray-500 mt-1">
              Agrega secretarias para que puedan gestionar tu agenda
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {secretaries.map((secretary) => (
              <div
                key={secretary.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={secretary.avatar_url || undefined} />
                    <AvatarFallback>
                      {secretary.nombre_completo.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">{secretary.nombre_completo}</h4>
                    <p className="text-sm text-gray-600">{secretary.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Agregada el {new Date(secretary.created_at).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(secretary.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(secretary.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Permisos de Secretarias
        </h4>
        <ul className="text-sm text-gray-600 space-y-1 ml-7">
          <li>• Ver y gestionar tu agenda de citas</li>
          <li>• Crear, modificar y cancelar citas</li>
          <li>• Ver información básica de pacientes</li>
          <li>• Enviar recordatorios de citas</li>
        </ul>
      </div>
    </div>
  );
}
