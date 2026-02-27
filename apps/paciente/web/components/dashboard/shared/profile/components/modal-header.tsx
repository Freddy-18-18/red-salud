import { X, Camera, Palette } from "lucide-react";
import { Avatar, AvatarFallback } from "@red-salud/design-system";
import { useState } from "react";
import { THEME_CONFIG, type ThemeColor } from "@red-salud/core/hooks";

interface ModalHeaderProps {
  userName: string;
  userEmail: string;
  onClose: () => void;
  avatarHover: boolean;
  onAvatarHover: (hover: boolean) => void;
  onAvatarClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  themeColor: ThemeColor;
  onThemeColorChange: (color: ThemeColor) => void;
}

export function ModalHeader({
  userName,
  userEmail,
  onClose,
  avatarHover,
  onAvatarHover,
  onAvatarClick,
  fileInputRef,
  onFileChange,
  themeColor,
  onThemeColorChange,
}: ModalHeaderProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const currentTheme = THEME_CONFIG[themeColor];
  const themeColors = Object.entries(THEME_CONFIG) as [ThemeColor, typeof THEME_CONFIG[ThemeColor]][];

  return (
    <>
      {/* Header compacto con gradiente personalizable */}
      <header className={`relative h-20 bg-gradient-to-br ${currentTheme.gradient.from} ${currentTheme.gradient.to} shrink-0`}>
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Cambiar color del tema"
            >
              <Palette className="h-4 w-4 text-white" />
            </button>

            {showColorPicker && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl p-3 z-10 min-w-[200px]">
                <p className="text-xs font-semibold text-gray-700 mb-2">Color del tema</p>
                <div className="grid grid-cols-3 gap-2">
                  {themeColors.map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        onThemeColorChange(key);
                        setShowColorPicker(false);
                      }}
                      className={`h-10 rounded-md bg-gradient-to-br ${config.gradient.from} ${config.gradient.to} hover:scale-105 transition-transform ${themeColor === key ? "ring-2 ring-gray-900 ring-offset-2" : ""
                        }`}
                      title={config.name}
                      aria-label={`Cambiar a tema ${config.name}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </header>

      {/* Avatar Section - Flotante sobre el header */}
      <section className="relative px-8 -mt-12 shrink-0">
        <div className="flex items-start gap-5 pb-6">
          {/* Contenedor blanco detrás */}
          <div className="absolute left-8 top-12 right-8 bg-white rounded-lg h-20 -z-10" />

          {/* Avatar */}
          <div
            className="relative inline-block z-10"
            onMouseEnter={() => onAvatarHover(true)}
            onMouseLeave={() => onAvatarHover(false)}
          >
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
              <AvatarFallback className={`${currentTheme.bg} ${currentTheme.text} text-3xl font-bold`}>
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {avatarHover && (
              <button
                onClick={onAvatarClick}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity"
                aria-label="Cambiar foto de perfil"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
              aria-label="Seleccionar imagen"
            />
          </div>

          {/* Nombre y Email */}
          <div className="flex-1 pt-14 px-4 z-10">
            <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
            <p className="text-sm text-gray-600 mt-1">{userEmail}</p>
          </div>
        </div>
      </section>
    </>
  );
}
