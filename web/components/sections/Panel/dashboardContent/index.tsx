'use client';

import { RecentActivity } from "../recentActivity";
import { SideBar } from "@/components/sideBar";
import { Header } from "@/components/header";
import { useState } from "react";
import { Plus } from "lucide-react";
import { TasksAndProjects } from "../tasksAndProjects";
import { CreateProjectModal } from "../createProjectModal";

export function DashboardContent() {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    const [isOpenProjectModal, setIsOpenProjectModal] = useState(false);


    return (
        <>
            <div className="flex items-start w-full min-h-screen">
                <SideBar isSideBarOpen = {isSideBarOpen} setIsSideBarOpen = {setIsSideBarOpen} />

                <main className="ml-0 lg:ml-64 flex-1">
                    <Header setIsSideBarOpen = {setIsSideBarOpen} />
                    <div className="p-3 lg:p-10">
                        <div className="flex justify-between items-center gap-10 lg:gap-0">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold text-gray-800">Bem-vindo, Arthur</h1>
                                <p className="text-base font-normal text-gray-500">Você tem 4 projetos ativos e 12 tarefas pendentes hoje.</p>
                            </div>
                            <button onClick={() => setIsOpenProjectModal(true)} className="p-3 rounded-xl bg-[#1F108E] font-semibold text-white cursor-pointer transition-all duration-500 hover:bg-[#100752] flex items-center gap-1"><Plus className="font-bold text-2xl m-auto"/> Criar Projeto</button>
                        </div>
                        <TasksAndProjects />
                        <RecentActivity />
                    </div>
                </main>
            </div>
            <CreateProjectModal setIsOpenModal={setIsOpenProjectModal} isOpenModal={isOpenProjectModal} />
        </>
    )
}