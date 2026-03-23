"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PostDetail } from "@/components/community/post-detail";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCommunityPost,
  usePostReplies,
  useVoting,
  useCommunityUser,
} from "@/hooks/use-community";
import type { VoteType } from "@/lib/services/community-service";

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { userId, isDoctor } = useCommunityUser();
  const { post, loading: postLoading } = useCommunityPost(id);
  const { replies, loading: repliesLoading, addReply } = usePostReplies(id);
  const { votes, vote } = useVoting(userId, id);

  const handleVote = (
    targetType: "post" | "reply",
    targetId: string,
    voteType: VoteType
  ) => {
    vote(targetType, targetId, voteType);
  };

  const handleReply = async (content: string) => {
    if (!userId) return;
    await addReply(userId, content, isDoctor);
  };

  const handleBack = () => {
    router.push("/dashboard/comunidad");
  };

  if (postLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Publicacion no encontrada</p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-4 text-emerald-600 text-sm font-medium hover:text-emerald-700"
        >
          Volver a la comunidad
        </button>
      </div>
    );
  }

  return (
    <PostDetail
      post={post}
      replies={replies}
      votes={votes}
      userId={userId}
      onVote={handleVote}
      onReply={handleReply}
      onBack={handleBack}
      repliesLoading={repliesLoading}
    />
  );
}
