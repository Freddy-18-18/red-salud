"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Users, BookOpen, MessageCircle, Award } from "lucide-react";
import { subscribeToAuthor } from "@/lib/api/blog";
import type { AuthorInfo } from "@/lib/types/blog";

interface AuthorCardProps {
  author: AuthorInfo;
  subscriberCount?: number;
  showStats?: boolean;
  compact?: boolean;
}

export function AuthorCard({ 
  author, 
  subscriberCount = 0, 
  showStats = true,
  compact = false 
}: AuthorCardProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribers, setSubscribers] = useState(subscriberCount);

  async function handleSubscribe(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const subscribed = await subscribeToAuthor(author.id);
      setIsSubscribed(subscribed);
      setSubscribers(prev => subscribed ? prev + 1 : prev - 1);
    } catch (error) {
      console.error("Error subscribing:", error);
    }
  }

  if (compact) {
    return (
      <Link href={`/blog/autor/${author.id}`}>
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.avatar_url || ''} />
            <AvatarFallback>{author.nombre_completo?.[0] || 'A'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-medium text-sm truncate">{author.nombre_completo}</span>
              {(author.verified || author.doctor_details?.verified) && (
                <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
              )}
            </div>
            {author.specialty_name && (
              <p className="text-xs text-gray-500 truncate">{author.specialty_name}</p>
            )}
          </div>
          {author.reputation && (
            <Badge variant="secondary" className="text-xs">
              {author.reputation.total_points} pts
            </Badge>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Card className="p-5">
      <div className="text-center mb-4">
        <Link href={`/blog/autor/${author.id}`}>
          <Avatar className="h-20 w-20 mx-auto mb-3 hover:ring-2 hover:ring-blue-500 transition-all">
            <AvatarImage src={author.avatar_url || ''} />
            <AvatarFallback className="text-2xl">
              {author.nombre_completo?.[0] || 'A'}
            </AvatarFallback>
          </Avatar>
        </Link>
        <Link href={`/blog/autor/${author.id}`}>
          <h4 className="font-semibold flex items-center justify-center gap-2 hover:text-blue-600 transition-colors">
            {author.nombre_completo}
            {(author.verified || author.doctor_details?.verified) && (
              <CheckCircle className="h-4 w-4 text-blue-500" />
            )}
          </h4>
        </Link>
        {author.specialty_name && (
          <p className="text-sm text-gray-500">{author.specialty_name}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          <Users className="h-3 w-3 inline mr-1" />
          {subscribers} seguidores
        </p>
      </div>

      {showStats && author.reputation && (
        <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <BookOpen className="h-4 w-4 mx-auto mb-1 text-blue-500" />
            <p className="font-semibold">{author.reputation.total_points}</p>
            <p className="text-xs text-gray-500">Puntos</p>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <MessageCircle className="h-4 w-4 mx-auto mb-1 text-green-500" />
            <p className="font-semibold">-</p>
            <p className="text-xs text-gray-500">Respuestas</p>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <Award className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
            <p className="font-semibold">{author.reputation.level_name}</p>
            <p className="text-xs text-gray-500">Nivel</p>
          </div>
        </div>
      )}

      <Button 
        className="w-full"
        variant={isSubscribed ? "secondary" : "default"}
        onClick={handleSubscribe}
      >
        {isSubscribed ? 'Siguiendo' : 'Seguir autor'}
      </Button>
    </Card>
  );
}
