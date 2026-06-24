import Image from "next/image";
import { MessageSquare, X, SendHorizontal } from "lucide-react";
import React from "react";

interface ChatProps {
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function Chat({ setIsChatOpen }:ChatProps) {
  const mensagens = [
    {
      id: 1,
      nome: "John Doe",
      avatar: "/images/userImg.jpg",
      texto: "Oi pessoal, terminei a implementação do menu lateral.",
      horario: "09:45 AM",
      isMe: false,
    },
    {
      id: 2,
      nome: "Sara Johnson",
      avatar: "/images/userImg.jpg",
      texto: "Ótimo! Vou revisar hoje à tarde.",
      horario: "09:48 AM",
      isMe: true,
    },
    {
      id: 3,
      nome: "Ane Silva",
      avatar: "/images/userImg.jpg",
      texto: "Alguém viu os novos assets no Drive?",
      horario: "10:02 AM",
      isMe: false,
    },
  ];

  return (
    <div className="w-full h-full lg:w-80 lg:h-125 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden fixed right-0 bottom-2 lg:bottom-24 lg:right-6 z-50">
      
      <div className="bg-[#1F108E] p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 stroke-2" />
          <span className="font-bold text-sm tracking-wide">Chat do Projeto</span>
        </div>
        <button onClick={() => setIsChatOpen(false)} className="cursor-pointer hover:bg-white/10 p-1 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-white flex flex-col gap-4 scrollbar-thin">
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 max-w-[85%] ${
              msg.isMe ? "self-end flex-row-reverse" : "self-start"
            }`}
          >
            {/* Avatar (só aparece se NÃO for eu) */}
            {/* {!msg.isMe && ( */}
              <div className="w-7 h-7 rounded-full overflow-hidden relative shrink-0 mt-1">
                <Image
                  src={msg.avatar}
                  alt={msg.nome}
                  fill
                  className="object-cover"
                />
              </div>
            {/* )} */}

            {/* Caixa da Mensagem */}
            <div className="flex flex-col gap-0.5">
              <div
                className={`rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.isMe
                    ? "bg-[#1F108E] text-white rounded-tr-none"
                    : "bg-[#F5F4FA] text-gray-800 rounded-tl-none"
                }`}
              >
                {/* Nome do Remetente (se não for eu) */}
                {/* {!msg.isMe && ( */}
                  <span className={`block font-bold ${msg.isMe ? 'text-white' : 'text-[#100752]'} mb-1`}>
                    {msg.nome}
                  </span>
                {/* )} */}
                <p>{msg.texto}</p>
              </div>
              
              <span
                className={`text-[9px] font-medium text-gray-400 mt-1 ${
                  msg.isMe ? "text-right" : "text-left"
                }`}
              >
                {msg.horario}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-[#FAFAFE] border-t border-[#F1F0F7] flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            placeholder="Escreva uma mensagem..."
            className="w-full bg-[#EAE8F2]/40 border border-[#EAE8F2] rounded-full py-2.5 pl-4 pr-10 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1F108E] transition-all"
          />
          <button className="absolute right-2 bg-[#1F108E] hover:bg-[#100752] text-white p-1.5 rounded-full transition-colors flex items-center justify-center">
            <SendHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}