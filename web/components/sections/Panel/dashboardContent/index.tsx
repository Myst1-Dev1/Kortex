'use client';

import Link from "next/link";
import { RecentActivity } from "../recentActivity";
import Image from "next/image";
import { SideBar } from "@/components/sideBar";
import { Header } from "@/components/header";
import { Star, Plus } from "lucide-react";
import { useState } from "react";

export function DashboardContent() {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    
    return (
        <>
            <div className="flex items-start w-full min-h-screen">
                <SideBar isSideBarOpen = {isSideBarOpen} setIsSideBarOpen = {setIsSideBarOpen} />

                <main className="ml-0 lg:ml-64 flex-1">
                    <Header setIsSideBarOpen = {setIsSideBarOpen} />
                    <div className="p-10">
                        <div className="flex justify-between items-center gap-10 lg:gap-0">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold text-gray-800">Bem-vindo, Arthur</h1>
                                <p className="text-base font-normal text-gray-500">Você tem 4 projetos ativos e 12 tarefas pendentes hoje.</p>
                            </div>
                            <button className="p-3 rounded-xl bg-[#1F108E] font-semibold text-white cursor-pointer transition-all duration-500 hover:bg-[#100752] flex items-center gap-1"><Plus className="font-bold text-2xl m-auto"/> Criar Projeto</button>
                        </div>
                        <div className="mt-10 grid grid-cols-2 gap-10 lg:gap-0 place-items-center lg:grid-cols-3 2xl:grid-cols-4">
                            <div className="bg-white border border-[#F1F0F7] shadow-sm max-w-80 w-full rounded-xl p-4">
                                <div className="flex justify-between items-center w-full">
                                    <div className="w-10 h-10 rounded-md grid place-items-center bg-[#F5F4FA]"><Star className="text-[#1F108E] w-5 h-5" /></div>
                                    <span className="bg-[#F0FDF4] font-bold uppercase text-[#15803D] rounded-full py-2 px-5 border border-[#DCFCE7] text-sm">ativo</span>
                                </div>
                                <h3 className="text-xl font-semibold my-2">Redesign Plataforma SaaS</h3>
                                <p className="text-sm text-gray-400">Lorem ipsum dolor sit amet,
                                    consectetur adipiscing elit. Sed do…
                                </p>
                                <div className="mt-10 border-t border-gray-200">
                                    <div className="mt-5 flex items-center justify-between">
                                        <div className="flex -space-x-2.5 items-center">
                                            <Image 
                                                className="w-9 h-9 object-cover rounded-full border-2 border-white z-0" 
                                                src='/images/userImg.jpg' 
                                                width={32} 
                                                height={32} 
                                                alt="participante do projeto" 
                                            />
                                            <Image 
                                                className="w-9 h-9 object-cover rounded-full border-2 border-white z-10" 
                                                src='/images/userImg.jpg' 
                                                width={32} 
                                                height={32} 
                                                alt="participante do projeto" 
                                            />
                                            <Image 
                                                className="w-9 h-9 object-cover rounded-full border-2 border-white z-20" 
                                                src='/images/userImg.jpg' 
                                                width={32} 
                                                height={32} 
                                                alt="participante do projeto" 
                                            />
                                            

                                            <div className="w-9 h-9 rounded-full border-2 border-white bg-[#EAE8F2] flex items-center justify-center z-30 text-xs font-bold text-[#4A4A68]">
                                                +2
                                            </div>
                                        </div>
                                        <Link href="/project/1" className="cursor-pointer p-3 font-bold text-base text-[#1F108E] border border-[#1F108E]/20 rounded-xl transition-all duration-500 hover:bg-[#100752] hover:text-white">Ver Projeto</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border border-[#F1F0F7] shadow-sm max-w-80 w-full rounded-xl p-4">
                                <div className="flex justify-between items-center w-full">
                                    <div className="w-10 h-10 rounded-md grid place-items-center bg-[#F5F4FA]"><Star className="text-[#1F108E] w-5 h-5" /></div>
                                    <span className="bg-[#F0FDF4] font-bold uppercase text-[#15803D] rounded-full py-2 px-5 border border-[#DCFCE7] text-sm">ativo</span>
                                </div>
                                <h3 className="text-xl font-semibold my-2">Redesign Plataforma SaaS</h3>
                                <p className="text-sm text-gray-400">Lorem ipsum dolor sit amet,
                                    consectetur adipiscing elit. Sed do…
                                </p>
                                <div className="mt-10 border-t border-gray-200">
                                    <div className="mt-5 flex items-center justify-between">
                                        <div className="flex -space-x-2.5 items-center">
                                            <Image 
                                                className="w-9 h-9 object-cover rounded-full border-2 border-white z-0" 
                                                src='/images/userImg.jpg' 
                                                width={32} 
                                                height={32} 
                                                alt="participante do projeto" 
                                            />
                                            <Image 
                                                className="w-9 h-9 object-cover rounded-full border-2 border-white z-10" 
                                                src='/images/userImg.jpg' 
                                                width={32} 
                                                height={32} 
                                                alt="participante do projeto" 
                                            />
                                            <Image 
                                                className="w-9 h-9 object-cover rounded-full border-2 border-white z-20" 
                                                src='/images/userImg.jpg' 
                                                width={32} 
                                                height={32} 
                                                alt="participante do projeto" 
                                            />
                                            

                                            <div className="w-9 h-9 rounded-full border-2 border-white bg-[#EAE8F2] flex items-center justify-center z-30 text-xs font-bold text-[#4A4A68]">
                                                +2
                                            </div>
                                        </div>
                                        <Link href="/project/1" className="cursor-pointer p-3 font-bold text-base text-[#1F108E] border border-[#1F108E]/20 rounded-xl transition-all duration-500 hover:bg-[#100752] hover:text-white">Ver Projeto</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border border-[#F1F0F7] shadow-sm max-w-80 w-full rounded-xl p-4">
                                <div className="flex justify-between items-center w-full">
                                    <div className="w-10 h-10 rounded-md grid place-items-center bg-[#F5F4FA]"><Star className="text-[#1F108E] w-5 h-5" /></div>
                                    <span className="bg-[#F0FDF4] font-bold uppercase text-[#15803D] rounded-full py-2 px-5 border border-[#DCFCE7] text-sm">ativo</span>
                                </div>
                                <h3 className="text-xl font-semibold my-2">Redesign Plataforma SaaS</h3>
                                <p className="text-sm text-gray-400">Lorem ipsum dolor sit amet,
                                    consectetur adipiscing elit. Sed do…
                                </p>
                                <div className="mt-10 border-t border-gray-200">
                                    <div className="mt-5 flex items-center justify-between">
                                        <div className="flex -space-x-2.5 items-center">
                                            <Image 
                                                className="w-9 h-9 object-cover rounded-full border-2 border-white z-0" 
                                                src='/images/userImg.jpg' 
                                                width={32} 
                                                height={32} 
                                                alt="participante do projeto" 
                                            />
                                            <Image 
                                                className="w-9 h-9 object-cover rounded-full border-2 border-white z-10" 
                                                src='/images/userImg.jpg' 
                                                width={32} 
                                                height={32} 
                                                alt="participante do projeto" 
                                            />
                                            <Image 
                                                className="w-9 h-9 object-cover rounded-full border-2 border-white z-20" 
                                                src='/images/userImg.jpg' 
                                                width={32} 
                                                height={32} 
                                                alt="participante do projeto" 
                                            />
                                            

                                            <div className="w-9 h-9 rounded-full border-2 border-white bg-[#EAE8F2] flex items-center justify-center z-30 text-xs font-bold text-[#4A4A68]">
                                                +2
                                            </div>
                                        </div>
                                        <Link href="/project/1" className="cursor-pointer p-3 font-bold text-base text-[#1F108E] border border-[#1F108E]/20 rounded-xl transition-all duration-500 hover:bg-[#100752] hover:text-white">Ver Projeto</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <RecentActivity />
                    </div>
                </main>
            </div>
        </>
    )
}