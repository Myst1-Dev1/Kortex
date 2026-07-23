"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4002";

interface UseChatSocketOptions {
  projectId: string;
  onNewMessage?: (message: any) => void;
  onEditMessage?: (message: any) => void;
  onDeleteMessage?: (data: { messageId: string }) => void;
}

export function useChatSocket({
  projectId,
  onNewMessage,
  onEditMessage,
  onDeleteMessage,
}: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_project", { projectId });
    });

    socket.on("new_message", (message: any) => {
      onNewMessage?.(message);
    });

    socket.on("edit_message", (message: any) => {
      onEditMessage?.(message);
    });

    socket.on("delete_message", (data: { messageId: string }) => {
      onDeleteMessage?.(data);
    });

    return () => {
      socket.emit("leave_project", { projectId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId, onNewMessage, onEditMessage, onDeleteMessage]);

  return socketRef;
}
