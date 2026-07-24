'use client';

import { RecentActivity } from "../recentActivity";
import { SideBar } from "@/components/sideBar";
import { Header } from "@/components/header";
import { useState } from "react";
import { Plus } from "lucide-react";
import { TasksAndProjects } from "../tasksAndProjects";
import { CreateProjectModal } from "../createProjectModal";
import { useUser } from "@/services/user";
import { Project } from "@/lib/actions/projects";
import { Task } from "@/lib/actions/tasks";

interface DashboardContentProps {
    data: Project | any;
    tasks?: Task[];
    projects?: Project[];
}

export function DashboardContent({ data, tasks = [], projects = [] }: DashboardContentProps) {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    const [isOpenProjectModal, setIsOpenProjectModal] = useState(false);

    const { user } = useUser();

    const pendingTasks = tasks.filter(
        (t) => t.status !== "DONE"
    ).length;
    const activeProjects = projects.length;

    return (
        <>
            <div className="flex items-start w-full min-h-screen">
                <SideBar isSideBarOpen = {isSideBarOpen} setIsSideBarOpen = {setIsSideBarOpen} />

                <main className="ml-0 lg:ml-64 flex-1">
                    <Header setIsSideBarOpen = {setIsSideBarOpen} />
                    <div className="p-3 lg:p-10">
                        <div className="flex justify-between items-center gap-10 lg:gap-0">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Bem-vindo, {user?.name}</h1>
                                <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                                    Você tem {activeProjects} projeto{activeProjects !== 1 ? "s" : ""} ativo{activeProjects !== 1 ? "s" : ""} e {pendingTasks} tarefa{pendingTasks !== 1 ? "s" : ""} pendente{pendingTasks !== 1 ? "s" : ""} hoje.
                                </p>
                            </div>
                            <button onClick={() => setIsOpenProjectModal(true)} className="p-3 rounded-xl bg-[#1F108E] font-semibold text-white cursor-pointer transition-all duration-500 hover:bg-[#100752] flex items-center gap-1"><Plus className="font-bold text-2xl m-auto"/> Criar Projeto</button>
                        </div>
                        <TasksAndProjects data = {data} />
                        <RecentActivity tasks={tasks} projects={projects} />
                    </div>
                </main>
            </div>
            <CreateProjectModal setIsOpenModal={setIsOpenProjectModal} isOpenModal={isOpenProjectModal} />
        </>
    )
}
