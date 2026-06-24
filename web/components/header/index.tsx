import { Bell, Menu, Moon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";

interface HeaderProps {
    setIsSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Header({ setIsSideBarOpen }:HeaderProps) {
    const path = usePathname();

    return (
        <>
            <header className="border-b border-[#C8C4D5] w-full">
                <div className="w-full flex justify-between items-center px-3 lg:px-10 py-3">
                    <div className="flex lg:block">
                        <Menu onClick={() => setIsSideBarOpen(true)} className="lg:hidden block mr-4 m-auto" />
                        {path === '/dashboard' 
                            ? 
                            <h2 className="text-xl font-semibold">Painel</h2> 
                            :

                            path === '/project/1'
                            ?
                            <div className="space-y-1">
                                <h1 className="text-base lg:text-2xl font-bold text-gray-800">Redesign Web App</h1>
                                <p className="text-xs lg:text-base font-normal text-gray-500">Detalhes e acompanhamento do projeto principal.</p>
                            </div>
                            :
                            'Null'
                        }
                    </div>
                    <div className="shrink-0 flex items-center gap-5">
                        <Bell className="w-5 h-5 font-semibold cursor-pointer transition-all duration-500 hover:scale-110" />
                        <Moon className="w-5 h-5 font-semibold cursor-pointer transition-all duration-500 hover:scale-110" />
                        <Image width={40} height={40} className="w-10 h-10 object-cover rounded-full aspect-square" alt="foto do usuário logado" src="/images/userImg.jpg" />
                    </div>
                </div>
            </header>
        </>
    )
}