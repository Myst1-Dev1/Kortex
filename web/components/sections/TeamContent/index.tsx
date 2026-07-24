'use client';

import { useState } from "react";
import Image from "next/image";
import { Search, Users } from "lucide-react";
import { SideBar } from "@/components/sideBar";
import { Header } from "@/components/header";
import { PublicUser } from "@/lib/actions/auth";

interface TeamMemberWithProjects extends PublicUser {
  projects: { id: string; name: string }[];
}

interface TeamContentProps {
  members: TeamMemberWithProjects[];
}

export function TeamContent({ members }: TeamContentProps) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase())
      )
    : members;

  return (
    <div className="flex items-start w-full min-h-screen">
      <SideBar isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen} />

      <main className="ml-0 lg:ml-64 flex-1">
        <Header setIsSideBarOpen={setIsSideBarOpen} />
        <div className="p-3 lg:p-10">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Equipe</h1>

          <div className="relative w-full sm:w-56 mb-6">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar membro..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-[#1F108E] transition-colors w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              {search ? "Nenhum membro encontrado" : "Nenhum participante nos seus projetos"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filtered.map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-gray-800 border border-[#F1F0F7] dark:border-gray-700 shadow-sm rounded-xl p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Image
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#EAE8F2]"
                      src={member.avatarUrl || "/images/userImg.jpg"}
                      width={48}
                      height={48}
                      alt={member.name}
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{member.email}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <Users className="w-3.5 h-3.5" />
                      <span className="font-medium">
                        {member.projects.length} {member.projects.length === 1 ? "projeto" : "projetos"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {member.projects.map((p) => (
                        <span
                          key={p.id}
                          className="px-2 py-0.5 bg-[#F5F4FA] text-[#4A4A68] rounded-md text-[10px] font-medium border border-[#EAE8F2]"
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
