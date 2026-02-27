// ============================================================================
// New Chat Dialog - Find & start conversations
// ============================================================================

"use client";

import { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import {
  X,
  Search,
  Users,
  UserPlus,
  MessageSquarePlus,
  ArrowLeft,
  Check,
  Megaphone,
  Shield,
} from "lucide-react";
import type { UserProfile } from "./types";
import { cn } from "@/lib/utils";

interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDirect: (userId: string) => void;
  onCreateGroup: (name: string, memberIds: string[]) => void;
  onSearchUsers: (query: string) => Promise<UserProfile[]>;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const ROLE_LABELS: Record<string, string> = {
  medico: "Médico",
  paciente: "Paciente",
  farmacia: "Farmacia",
  secretaria: "Secretaria",
  seguro: "Seguro",
  corporativo: "Corporativo",
  admin: "Admin",
};

const ROLE_COLORS: Record<string, string> = {
  medico: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  paciente: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  farmacia: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  secretaria: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

type View = "main" | "group";

export function NewChatDialog({
  isOpen,
  onClose,
  onCreateDirect,
  onCreateGroup,
  onSearchUsers,
}: NewChatDialogProps) {
  const [view, setView] = useState<View>("main");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [groupName, setGroupName] = useState("");

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await onSearchUsers(query);
        setSearchResults(results);
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [onSearchUsers]
  );

  const toggleUser = (user: UserProfile) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) return prev.filter((u) => u.id !== user.id);
      return [...prev, user];
    });
  };

  const handleCreateGroup = () => {
    if (selectedUsers.length < 2 || !groupName.trim()) return;
    onCreateGroup(
      groupName.trim(),
      selectedUsers.map((u) => u.id)
    );
    handleClose();
  };

  const handleClose = () => {
    setView("main");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsers([]);
    setGroupName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
          {view === "group" ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setView("main")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : null}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
            {view === "main" ? "Nueva conversación" : "Nuevo grupo"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-gray-600"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Group creation header */}
        {view === "group" && (
          <div className="px-4 py-3 space-y-3 border-b border-gray-100 dark:border-gray-800">
            <Input
              placeholder="Nombre del grupo..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="h-10 rounded-xl border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500"
            />

            {/* Selected users chips */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedUsers.map((user) => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="pl-1.5 pr-1 py-0.5 gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                  >
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[6px] bg-emerald-200">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[11px]">{user.full_name.split(" ")[0]}</span>
                    <button
                      onClick={() => toggleUser(user)}
                      className="ml-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full p-0.5"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick actions (main view) */}
        {view === "main" && (
          <div className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setView("group")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Nuevo grupo
                </p>
                <p className="text-[11px] text-gray-500">
                  Crea un grupo de comunicación
                </p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Canal de difusión
                </p>
                <p className="text-[11px] text-gray-500">
                  Envía mensajes a múltiples personas
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar contactos..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border-0 focus-visible:ring-1 focus-visible:ring-emerald-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
          {isSearching ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                No se encontraron contactos
              </p>
            </div>
          ) : searchQuery.length < 2 ? (
            <div className="text-center py-8">
              <Search className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                Escribe al menos 2 caracteres para buscar
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {searchResults.map((user) => {
                const isSelected = selectedUsers.some(
                  (u) => u.id === user.id
                );
                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      if (view === "group") {
                        toggleUser(user);
                      } else {
                        onCreateDirect(user.id);
                        handleClose();
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left",
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-950/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-11 w-11">
                        {user.avatar_url ? (
                          <AvatarImage
                            src={user.avatar_url}
                            alt={user.full_name}
                          />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-semibold">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Selection check */}
                      {isSelected && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.full_name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {user.role && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              ROLE_COLORS[user.role] || ""
                            )}
                          >
                            {ROLE_LABELS[user.role] || user.role}
                          </Badge>
                        )}
                        {user.specialty && (
                          <span className="text-[11px] text-gray-500 truncate">
                            {user.specialty}
                          </span>
                        )}
                      </div>
                    </div>

                    {view === "main" && (
                      <MessageSquarePlus className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Create Group Button */}
        {view === "group" && selectedUsers.length >= 2 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11 font-medium"
            >
              <Users className="h-4 w-4 mr-2" />
              Crear grupo ({selectedUsers.length} miembros)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
