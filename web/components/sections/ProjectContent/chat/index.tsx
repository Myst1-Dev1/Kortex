import Image from "next/image";
import { MessageSquare, X, SendHorizontal } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@/services/user";
import {
  sendMessageAction,
  getLatestMessagesAction,
  type ChatMessage,
} from "@/lib/actions/chat";
import { getUsersByIdsAction, type PublicUser } from "@/lib/actions/auth";
import { LoadingDots } from "@/components/ui/loadingDots";
import { useChatSocket } from "@/hooks/useChatSocket";

interface ChatProps {
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectId: string;
}

export function Chat({ setIsChatOpen, projectId }: ChatProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userCacheRef = useRef<Map<string, PublicUser>>(new Map());
  const [userCacheVersion, setUserCacheVersion] = useState(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    async function loadMessages() {
      setIsLoadingMessages(true);
      const result = await getLatestMessagesAction(projectId);
      if (result.success) {
        setMessages(result.data);
      } else {
        setError(result.error);
      }
      setIsLoadingMessages(false);
    }

    if (projectId) {
      loadMessages();
    }
  }, [projectId]);

  useEffect(() => {
    if (!messages.length) return;

    const unknownIds = [
      ...new Set(
        messages
          .map((m) => m.sender_id)
          .filter((id) => id && !userCacheRef.current.has(id))
      ),
    ];

    if (!unknownIds.length) return;

    getUsersByIdsAction(unknownIds).then((users) => {
      let changed = false;
      for (const u of users) {
        if (!userCacheRef.current.has(u.id)) {
          userCacheRef.current.set(u.id, u);
          changed = true;
        }
      }
      if (changed) setUserCacheVersion((v) => v + 1);
    });
  }, [messages]);

  const handleNewMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const handleEditMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, ...message } : m))
    );
  }, []);

  const handleDeleteMessage = useCallback((data: { messageId: string }) => {
    setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
  }, []);

  useChatSocket({
    projectId,
    onNewMessage: handleNewMessage,
    onEditMessage: handleEditMessage,
    onDeleteMessage: handleDeleteMessage,
  });

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setError(null);
    setInput("");

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      project_id: projectId,
      sender_id: user?.id ?? "",
      message: text,
      created_at: new Date().toISOString(),
      sender: {
        id: user?.id ?? "",
        name: user?.name ?? "Você",
        avatarUrl: user?.avatarUrl,
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const result = await sendMessageAction(projectId, text);

      if (result.success) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? result.data : msg))
        );
      } else {
        setError(result.error);
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      }
    } catch {
      setError("Erro ao enviar mensagem");
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, projectId, user]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const getSender = useCallback(
    (msg: ChatMessage): { name?: string; avatarUrl?: string } | undefined => {
      if (msg.sender?.name) return msg.sender;
      return userCacheRef.current.get(msg.sender_id);
    },
    [userCacheVersion]
  );

  const formatTime = (isoDate?: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full h-full lg:w-80 lg:h-125 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden fixed right-0 bottom-2 lg:bottom-24 lg:right-6 z-50">
      <div className="bg-[#1F108E] p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 stroke-2" />
          <span className="font-bold text-sm tracking-wide">Chat do Projeto</span>
        </div>
        <button
          onClick={() => setIsChatOpen(false)}
          className="cursor-pointer hover:bg-white/10 p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-white flex flex-col gap-4 scrollbar-thin">
        {isLoadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingDots />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
            Nenhuma mensagem ainda
          </div>
        ) : (
          messages.map((msg, index:number) => {
            const isMe = msg.sender_id === user?.id;
            const sender = getSender(msg);
            return (
              <div
                key={index}
                className={`flex gap-2.5 max-w-[85%] ${
                  isMe ? "self-end flex-row-reverse" : "self-start"
                }`}
              >
                <div className="w-7 h-7 rounded-full overflow-hidden relative shrink-0 mt-1">
                  <Image
                    src={sender?.avatarUrl || "/images/userImg.jpg"}
                    alt={sender?.name || "Usuário"}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col gap-0.5">
                  <div
                    className={`rounded-2xl p-3 text-xs leading-relaxed ${
                      isMe
                        ? "bg-[#1F108E] text-white rounded-tr-none"
                        : "bg-[#F5F4FA] text-gray-800 rounded-tl-none"
                    }`}
                  >
                    <span
                      className={`block font-bold ${
                        isMe ? "text-white" : "text-[#100752]"
                      } mb-1`}
                    >
                      {isMe ? "Você" : sender?.name ?? "Usuário"}
                    </span>
                    <p>{msg.message}</p>
                  </div>

                  <span
                    className={`text-[9px] font-medium text-gray-400 mt-1 ${
                      isMe ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-2.5 self-start">
            <div className="w-7 h-7 rounded-full overflow-hidden relative shrink-0 mt-1 bg-[#F5F4FA] flex items-center justify-center">
              <LoadingDots />
            </div>
          </div>
        )}

        {error && (
          <div className="text-[10px] text-red-500 text-center bg-red-50 rounded-lg py-1.5 px-2">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-[#FAFAFE] border-t border-[#F1F0F7] flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva uma mensagem..."
            disabled={isLoading}
            className="w-full bg-[#EAE8F2]/40 border border-[#EAE8F2] rounded-full py-2.5 pl-4 pr-10 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1F108E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bg-[#1F108E] hover:bg-[#100752] text-white p-1.5 rounded-full transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <LoadingDots className="scale-75" />
            ) : (
              <SendHorizontal className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
