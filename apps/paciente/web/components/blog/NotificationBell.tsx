"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/design-system";
import { ScrollArea } from "@red-salud/design-system";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@red-salud/design-system";
import {
  Bell, BookOpen, MessageCircle, CheckCircle, ThumbsUp,
  Award, AtSign, UserPlus, Coins, Star, Check
} from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount
} from "@/lib/api/blog";
import type { CommunityNotification, CommunityNotificationType as NotificationType } from "@red-salud/types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  new_post: <BookOpen className="h-4 w-4 text-blue-500" />,
  new_answer: <MessageCircle className="h-4 w-4 text-green-500" />,
  answer_accepted: <CheckCircle className="h-4 w-4 text-green-600" />,
  new_comment: <MessageCircle className="h-4 w-4 text-purple-500" />,
  vote_received: <ThumbsUp className="h-4 w-4 text-orange-500" />,
  badge_earned: <Award className="h-4 w-4 text-yellow-500" />,
  mention: <AtSign className="h-4 w-4 text-blue-600" />,
  new_follower: <UserPlus className="h-4 w-4 text-teal-500" />,
  bounty_awarded: <Coins className="h-4 w-4 text-yellow-600" />,
  post_featured: <Star className="h-4 w-4 text-yellow-500" />,
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  async function loadUnreadCount() {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  }

  async function loadNotifications() {
    setLoading(true);
    try {
      const data = await getNotifications(false, 20);
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }

  function getNotificationLink(notification: CommunityNotification): string {
    switch (notification.notification_type) {
      case 'new_post':
      case 'post_featured':
        return `/blog/${notification.content_id}`;
      case 'new_answer':
      case 'answer_accepted':
        return `/blog/preguntas/${notification.content_id}`;
      case 'new_follower':
        return `/blog/autor/${notification.actor_id}`;
      case 'badge_earned':
        return '/blog/ranking';
      default:
        return '/blog';
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationLink(notification)}
                  onClick={() => {
                    if (!notification.is_read) {
                      handleMarkAsRead(notification.id);
                    }
                    setOpen(false);
                  }}
                >
                  <div className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {notification.actor ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={notification.actor.avatar_url || ''} />
                            <AvatarFallback>
                              {notification.actor.nombre_completo?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {notificationIcons[notification.notification_type]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: es
                          })}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t">
          <Link href="/blog/notificaciones">
            <Button variant="ghost" className="w-full text-sm">
              Ver todas las notificaciones
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
