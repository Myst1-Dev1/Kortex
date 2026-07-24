'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Plus, Search } from "lucide-react";
import { SideBar } from "@/components/sideBar";
import { Header } from "@/components/header";
import { CreateProjectModal } from "@/components/sections/Panel/createProjectModal";
import { Project } from "@/lib/actions/projects";

interface ProjectsContentProps {
  data: { success: boolean; data?: Project[]; error?: string };
}

export function ProjectsContent({ data }: ProjectsContentProps) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [isOpenProjectModal, setIsOpenProjectModal] = useState(false);
  const [search, setSearch] = useState("");

  const projects = data.success ? (data.data ?? []) : [];
  const filtered = search.trim()
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  return (
    <div className="flex items-start w-full min-h-screen">
      <SideBar isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen} />

      <main className="ml-0 lg:ml-64 flex-1">
        <Header setIsSideBarOpen={setIsSideBarOpen} />
        <div className="p-3 lg:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Meus Projetos</h1>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar projeto..."
                  className="pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-[#1F108E] transition-colors w-full sm:w-56 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>
              <button
                onClick={() => setIsOpenProjectModal(true)}
                className="px-4 py-2 rounded-xl bg-[#1F108E] text-white text-sm font-semibold cursor-pointer hover:bg-[#100752] transition-all flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Novo
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              {search ? "Nenhum projeto encontrado" : "Você ainda não criou nenhum projeto"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filtered.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="bg-white dark:bg-gray-800 border border-[#F1F0F7] dark:border-gray-700 shadow-sm rounded-xl p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="w-10 h-10 rounded-lg grid place-items-center bg-[#F5F4FA] dark:bg-gray-700 group-hover:bg-[#EAE8F2] transition-colors">
                      <Star className="text-[#1F108E] w-5 h-5" />
                    </div>
                    <span className="bg-[#F0FDF4] font-bold uppercase text-[#15803D] rounded-full py-1 px-3 border border-[#DCFCE7] text-[10px]">
                      ativo
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1 truncate">
                    {project.name}
                  </h3>
                  <div
                    className="text-gray-400 dark:text-gray-500 text-sm font-light line-clamp-2 mb-4"
                    dangerouslySetInnerHTML={{ __html: project?.description ?? "" }}
                  />

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex items-center justify-between">
                    {project.participants && project.participants.length > 0 ? (
                      <div className="flex -space-x-2">
                        {project.participants.slice(0, 3).map((p: any, i: number) => (
                          <Image
                            key={p.id || i}
                            className="w-7 h-7 rounded-full border-2 border-white object-cover"
                            style={{ zIndex: i * 10 }}
                            src={p.avatarUrl || "/images/userImg.jpg"}
                            width={28}
                            height={28}
                            alt={p.name || ""}
                          />
                        ))}
                        {project.participants.length > 3 && (
                          <div className="w-7 h-7 rounded-full border-2 border-white bg-[#EAE8F2] flex items-center justify-center text-[9px] font-bold text-[#4A4A68]">
                            +{project.participants.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">Sem participantes</span>
                    )}
                    <span className="text-xs font-medium text-[#1F108E] group-hover:underline">
                      Ver →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateProjectModal setIsOpenModal={setIsOpenProjectModal} isOpenModal={isOpenProjectModal} />
    </div>
  );
}
