"use client";

import { useRouter } from "next/navigation";

import { CreatePostForm } from "@/components/community/create-post-form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCommunityUser,
  useCommunitySpecialties,
  useCreatePost,
} from "@/hooks/use-community";
import type { CreatePostData } from "@/lib/services/community-service";

export default function CreatePostPage() {
  const router = useRouter();
  const { userId, loading: userLoading } = useCommunityUser();
  const { specialties, loading: specialtiesLoading } = useCommunitySpecialties();
  const { create, loading: createLoading } = useCreatePost();

  const handleSubmit = async (data: CreatePostData): Promise<boolean> => {
    if (!userId) return false;
    const result = await create(userId, data);
    return result.success;
  };

  const handleBack = () => {
    router.push("/dashboard/comunidad");
  };

  if (userLoading || specialtiesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">
          Debes iniciar sesion para crear una publicacion
        </p>
        <a
          href="/auth/login"
          className="mt-4 inline-block text-emerald-600 text-sm font-medium hover:text-emerald-700"
        >
          Iniciar sesion
        </a>
      </div>
    );
  }

  return (
    <CreatePostForm
      specialties={specialties}
      onSubmit={handleSubmit}
      onBack={handleBack}
      loading={createLoading}
    />
  );
}
