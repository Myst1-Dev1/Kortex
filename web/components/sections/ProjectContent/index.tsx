'use client';

import { useState } from "react";

import { Header } from "@/components/header";
import { SideBar } from "@/components/sideBar";
import { ConclusionGraphs } from "./conclusionGraphs";
import { ListTasks } from "./listTasks";
import { ChatBtn } from "./chatBtn";
import { Calendar, Layers, Plus } from "lucide-react";
import Image from "next/image";

export function ProjectContent() {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);

    return (
        <>
            <div className="flex items-start w-full min-h-screen">
                <SideBar isSideBarOpen = {isSideBarOpen} setIsSideBarOpen = {setIsSideBarOpen} />

                <main className="ml-0 lg:ml-64 flex-1">
                    <Header setIsSideBarOpen = {setIsSideBarOpen} />
                    <div className="p-3 lg:p-10">
                        <div className="mb-10 mt-2 lg:-mt-4 w-full bg-[#FAFAFE] rounded-2xl border border-[#F1F0F7] p-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                            <div className="space-y-3 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-[#E8E6F8] text-[#1F108E] text-xs font-bold px-3 py-1 rounded-lg">
                                    SaaS Pro
                                </span>
                                <h1 className="text-2xl lg:text-3xl font-extrabold text-[#100752] tracking-tight truncate">
                                    Redesign Web App
                                </h1>
                                </div>
                                
                                <p className="text-sm lg:text-base text-gray-500 font-medium max-w-2xl leading-relaxed">
                                Detalhes e acompanhamento de tarefas para a nova interface responsiva do ecossistema Kortex.
                                </p>

                                {/* Mini Meta-dados do Projeto */}
                                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>Prazo: 28 de Julho</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Layers className="w-4 h-4 text-gray-400" />
                                    <span>Sprint 4</span>
                                </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 xl:justify-end shrink-0">
                                
                                {/* Bloco da Equipe (Injetando o design de Avatares que fizemos!) */}
                                <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time do Projeto</span>
                                <div className="flex -space-x-2.5 items-center">
                                    <div className="w-8 h-8 rounded-full border-2 border-white z-30 relative overflow-hidden bg-gray-200">
                                        <Image src='/images/userImg.jpg' fill className="object-cover" alt="Membro" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full border-2 border-white z-20 relative overflow-hidden bg-gray-200">
                                        <Image src='/images/userImg.jpg' fill className="object-cover" alt="Membro" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full border-2 border-white z-10 relative overflow-hidden bg-gray-200">
                                        <Image src='/images/userImg.jpg' fill className="object-cover" alt="Membro" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-[#EAE8F2] flex items-center justify-center z-0 text-xs font-bold text-[#4A4A68]">
                                    +2
                                    </div>
                                </div>
                                </div>

                                {/* Linha Divisória Vertical apenas em telas grandes */}
                                <div className="hidden sm:block w-px h-10 bg-gray-200" />

                                {/* Seu Botão "Criar Tarefa" Estilizado */}
                                <button className="h-12 px-5 rounded-xl bg-[#1F108E] font-bold text-sm text-white cursor-pointer transition-all duration-300 hover:bg-[#100752] hover:shadow-lg hover:shadow-[#1f108e]/20 flex items-center gap-2 group shrink-0">
                                <Plus className="w-5 h-5 font-bold transition-transform group-hover:rotate-90 duration-300" />
                                <span>Criar Tarefa</span>
                                </button>

                            </div>

                        </div>
                        <ConclusionGraphs />
                        <ListTasks />
                    </div>
                </main>
            </div>
            <ChatBtn />
        </>
    )
}