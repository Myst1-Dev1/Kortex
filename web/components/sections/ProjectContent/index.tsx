'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/header";
import { SideBar } from "@/components/sideBar";
import { ConclusionGraphs } from "./conclusionGraphs";
import { ListTasks } from "./listTasks";
import { ChatBtn } from "./chatBtn";
import { Project } from "@/lib/actions/projects";

import { ProjectData } from "./projectData";

interface ProjectContentProps {
    data: Project | any;
    tasks: any;
}

export function ProjectContent({ data, tasks }:ProjectContentProps) {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    const router = useRouter();

    const handleRefresh = () => router.refresh();

    return (
        <>
            <div className="flex items-start w-full min-h-screen">
                <SideBar isSideBarOpen = {isSideBarOpen} setIsSideBarOpen = {setIsSideBarOpen} />

                <main className="ml-0 lg:ml-64 flex-1">
                    <Header setIsSideBarOpen = {setIsSideBarOpen} />
                    <div className="p-3 lg:p-10">
                        <ProjectData data={data} onProjectUpdated={handleRefresh} />
                        <ConclusionGraphs tasks={tasks?.data} />
                        <ListTasks tasks={tasks} participants={data?.data?.participants} onTaskChanged={handleRefresh} />
                    </div>
                </main>
            </div>
            <ChatBtn projectId={data?.data?.id ?? ""} />
        </>
    )
}