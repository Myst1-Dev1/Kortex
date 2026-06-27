import { MessageSquareText } from "lucide-react";
import { Chat } from "../chat";
import { useState } from "react";

export function ChatBtn() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsChatOpen(true)} // Adicione sua lógica de abrir o chat aqui
                className="cursor-pointer fixed bottom-6 right-6 z-50 bg-[#1F108E] hover:bg-[#100752] text-white font-semibold text-base py-3.5 px-6 rounded-full flex items-center gap-3 shadow-lg shadow-[#1f108e]/20 hover:scale-105 active:scale-95 transition-all duration-500"
            >
                <MessageSquareText className="w-6 h-6 stroke-2" />
                <span>Abrir Chat</span>
            </button>
            {isChatOpen && <Chat setIsChatOpen = {setIsChatOpen} />}
        </>
    );
}