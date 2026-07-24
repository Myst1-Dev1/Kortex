"use client";

import React, { useRef, useEffect } from "react";
import {
  CheckCheck,
  X,
  FilePlus,
  FileEdit,
  FileX,
  UserPlus,
  UserMinus,
  ArrowRightLeft,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { type Notification } from "@/lib/actions/notifications";
import { formatRelativeTime } from "@/lib/utils/relativeTime";

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  "task.created": <FilePlus className="w-4 h-4 text-[#1F108E]" />,
  "task.updated": <FileEdit className="w-4 h-4 text-[#1F108E]" />,
  "task.deleted": <FileX className="w-4 h-4 text-red-500" />,
  "task.assigned": <UserPlus className="w-4 h-4 text-emerald-600" />,
  "task.status.changed": <ArrowRightLeft className="w-4 h-4 text-amber-600" />,
  "chat.message.sent": <MessageSquare className="w-4 h-4 text-[#1F108E]" />,
  "project.member.added": <UserPlus className="w-4 h-4 text-emerald-600" />,
  "project.member.removed": <UserMinus className="w-4 h-4 text-red-500" />,
};

export function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: -8, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  function handleClick(notification: Notification) {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.project_id) {
      router.push(`/project/${notification.project_id}`);
    }
    onClose();
  }

  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 flex flex-col max-h-[70vh] overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F0F7] dark:border-gray-700">
        <span className="font-bold text-sm dark:text-blue-500 text-[#1F108E]">Notificações</span>
        {notifications.length > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 text-[10px] text-[#1F108E] hover:text-[#100752] font-medium cursor-pointer transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Marcar todas
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-thin">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400">
            Nenhuma notificação ainda
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-[#F1F0F7] dark:border-gray-700 last:border-b-0 transition-colors ${
                !n.read
                  ? "bg-[#F5F4FA] dark:bg-gray-700/50"
                  : "bg-white dark:bg-gray-800 hover:bg-[#FAFAFE] dark:hover:bg-gray-700/30"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {TYPE_ICONS[n.type] ?? (
                  <div className="w-4 h-4 rounded-full bg-gray-200" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-snug ${!n.read ? "font-bold text-gray-900 dark:text-gray-100" : "font-medium text-gray-700 dark:text-gray-300"}`}>
                  {n.title}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                  {n.description}
                </p>
                <span className="text-[9px] text-gray-400 mt-1 block">
                  {formatRelativeTime(n.created_at)}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(n.id);
                }}
                className="shrink-0 p-1 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
