import { Star, MapPin, Clock, Shield } from "lucide-react";

interface DoctorCardProps {
  id: string;
  name: string;
  specialty: string;
  avatarUrl?: string;
  rating?: number;
  reviewCount?: number;
  fee?: number;
  city?: string;
  state?: string;
  yearsExperience?: number;
  verified?: boolean;
  nextAvailable?: string;
  onBook?: () => void;
  onViewProfile?: () => void;
}

export function DoctorCard({
  name,
  specialty,
  avatarUrl,
  rating,
  reviewCount,
  fee,
  city,
  state,
  yearsExperience,
  verified,
  nextAvailable,
  onBook,
  onViewProfile,
}: DoctorCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const location = [city, state].filter(Boolean).join(", ");

  return (
    <div className="p-4 sm:p-5 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-xl font-semibold text-emerald-600">{initials}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">Dr. {name}</h3>
                {verified && (
                  <Shield className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-500">{specialty}</p>
            </div>
            {fee != null && (
              <span className="text-sm font-semibold text-emerald-600 whitespace-nowrap">
                ${fee.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
            {rating != null && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
                <span className="font-medium text-gray-700">{rating.toFixed(1)}</span>
                {reviewCount != null && <span>({reviewCount})</span>}
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{location}</span>
              </div>
            )}
            {yearsExperience != null && yearsExperience > 0 && (
              <span>{yearsExperience} anos exp.</span>
            )}
            {nextAvailable && (
              <div className="flex items-center gap-1 text-emerald-600">
                <Clock className="h-3.5 w-3.5" />
                <span>{nextAvailable}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {onViewProfile && (
              <button
                onClick={onViewProfile}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Ver perfil
              </button>
            )}
            {onBook && (
              <button
                onClick={onBook}
                className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition"
              >
                Agendar cita
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
