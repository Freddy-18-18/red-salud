"use client";

import { Users, UserPlus, Heart } from "lucide-react";
import { useState } from "react";

import { DeleteConfirm } from "@/components/family/delete-confirm";
import { MemberCard } from "@/components/family/member-card";
import { MemberDetail } from "@/components/family/member-detail";
import { MemberForm } from "@/components/family/member-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonList } from "@/components/ui/skeleton";
import { useFamily } from "@/hooks/use-family";
import { type FamilyMember, type CreateFamilyMember } from "@/lib/services/family-service";

type ModalState =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; member: FamilyMember }
  | { type: "detail"; member: FamilyMember }
  | { type: "delete"; member: FamilyMember };

export default function FamiliaPage() {
  const { members, loading, saving, error, addMember, updateMember, removeMember } =
    useFamily();
  const [modal, setModal] = useState<ModalState>({ type: "closed" });

  const handleAdd = async (data: CreateFamilyMember) => {
    const result = await addMember(data);
    return { success: result.success };
  };

  const handleEdit = async (data: CreateFamilyMember) => {
    if (modal.type !== "edit") return { success: false };
    return updateMember(modal.member.id, data);
  };

  const handleDelete = async () => {
    if (modal.type !== "delete") return;
    const result = await removeMember(modal.member.id);
    if (result.success) {
      setModal({ type: "closed" });
    }
  };

  const openDetail = (member: FamilyMember) => {
    setModal({ type: "detail", member });
  };

  const openEdit = (member: FamilyMember) => {
    setModal({ type: "edit", member });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-7 w-7 text-emerald-500" />
            Mi Familia
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona los perfiles de salud de tus familiares
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: "add" })}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex-shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Agregar familiar</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Family members list */}
      {members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={openEdit}
              onClick={openDetail}
            />
          ))}

          {/* Add another card */}
          <button
            type="button"
            onClick={() => setModal({ type: "add" })}
            className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <UserPlus className="h-4 w-4" />
            Agregar otro familiar
          </button>
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Aun no tienes familiares registrados"
          description="Agrega los perfiles de salud de tus familiares para gestionar sus citas y datos medicos desde un solo lugar."
          action={{
            label: "Agregar primer familiar",
            href: "#",
          }}
        />
      )}

      {/* Info box */}
      {members.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <Heart className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              Gestion familiar
            </p>
            <p className="text-sm text-blue-700 mt-0.5">
              Puedes agendar citas y consultar el historial medico de cada familiar
              directamente desde su perfil.
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      {modal.type === "add" && (
        <MemberForm
          onSubmit={handleAdd}
          onClose={() => setModal({ type: "closed" })}
          saving={saving}
        />
      )}

      {modal.type === "edit" && (
        <MemberForm
          member={modal.member}
          onSubmit={handleEdit}
          onClose={() => setModal({ type: "closed" })}
          saving={saving}
        />
      )}

      {modal.type === "detail" && (
        <MemberDetail
          member={modal.member}
          onClose={() => setModal({ type: "closed" })}
          onEdit={(m) => setModal({ type: "edit", member: m })}
          onDelete={(m) => setModal({ type: "delete", member: m })}
        />
      )}

      {modal.type === "delete" && (
        <DeleteConfirm
          memberName={modal.member.full_name}
          onConfirm={handleDelete}
          onCancel={() => setModal({ type: "closed" })}
          deleting={saving}
        />
      )}
    </div>
  );
}
