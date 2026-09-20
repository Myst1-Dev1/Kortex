"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { parseCookies } from 'nookies';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://lab.mystdev.com.br";

interface UseChatSocketOptions {
  projectId: string;
  onNewMessage?: (message: any) => void;
  onEditMessage?: (message: any) => void;
  onDeleteMessage?: (data: { messageId: string }) => void;
  onUserJoinedVoice?: (data: { userId: string; socketId: string; activeUsers: string[] }) => void;
  onUserLeftVoice?: (data: { userId: string; socketId: string; activeUsers: string[] }) => void;
  onVoiceParticipants?: (data: { socketIds: string[]; activeUsers: string[] }) => void;
  onVoiceSignal?: (data: { senderSocketId: string; senderUserId: string; signal: any }) => void;
}

export function useChatSocket({
  projectId,
  onNewMessage,
  onEditMessage,
  onDeleteMessage,
  onUserJoinedVoice,
  onUserLeftVoice,
  onVoiceParticipants,
  onVoiceSignal,
}: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const voiceJoinRequestedRef = useRef(false);
  const callbacksRef = useRef({
    onNewMessage,
    onEditMessage,
    onDeleteMessage,
    onUserJoinedVoice,
    onUserLeftVoice,
    onVoiceParticipants,
    onVoiceSignal,
  });

  callbacksRef.current = {
    onNewMessage,
    onEditMessage,
    onDeleteMessage,
    onUserJoinedVoice,
    onUserLeftVoice,
    onVoiceParticipants,
    onVoiceSignal,
  };

  useEffect(() => {
    if (!projectId) return;
    
    const cookies = parseCookies();
    const token = cookies.access_token;

    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_project", { projectId });
      if (voiceJoinRequestedRef.current) {
        socket.emit("join_voice", { projectId });
      }
    });

    socket.on("new_message", (message: any) => {
      callbacksRef.current.onNewMessage?.(message);
    });

    socket.on("edit_message", (message: any) => {
      callbacksRef.current.onEditMessage?.(message);
    });

    socket.on("delete_message", (data: { messageId: string }) => {
      callbacksRef.current.onDeleteMessage?.(data);
    });

    // Eventos de Voz
    socket.on("user_joined_voice", (data) => {
      callbacksRef.current.onUserJoinedVoice?.(data);
    });

    socket.on("user_left_voice", (data) => {
      callbacksRef.current.onUserLeftVoice?.(data);
    });

    socket.on("voice_participants", (data) => {
      callbacksRef.current.onVoiceParticipants?.(data);
    });

    socket.on("voice_signal", (data) => {
      callbacksRef.current.onVoiceSignal?.(data);
    });

    return () => {
      voiceJoinRequestedRef.current = false;
      socket.emit("leave_project", { projectId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId]);

  const joinVoice = useCallback(() => {
    voiceJoinRequestedRef.current = true;
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("join_voice", { projectId });
    }
  }, [projectId]);

  const leaveVoice = useCallback(() => {
    voiceJoinRequestedRef.current = false;
    socketRef.current?.emit("leave_voice", { projectId });
  }, [projectId]);

  const sendVoiceSignal = useCallback((targetSocketId: string, signal: any) => {
    socketRef.current?.emit("voice_signal", { targetSocketId, signal });
  }, []);

  return {
    socketRef,
    joinVoice,
    leaveVoice,
    sendVoiceSignal,
  };
}