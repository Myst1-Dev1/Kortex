'use client';

import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users2, 
  BarChart3, 
  PlusCircle, 
  LogOut, 
  XIcon
} from "lucide-react";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import Link from "next/link";

interface SideBarProps {
  isSideBarOpen: boolean;
  setIsSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SideBar({ isSideBarOpen, setIsSideBarOpen }:SideBarProps) {
  const router = useRouter();
  const path = usePathname();

  console.log(path)
  
  const menuItems = [
    { name: "Dashboard", link:"/dashboard", icon: LayoutDashboard },
    { name: "Projetos", link:"/projects", icon: FolderKanban },
    { name: "Tarefas", link:"/tasks", icon: CheckSquare },
    { name: "Equipe", link:"/team", icon: Users2},
    { name: "Relatórios", link:"/reports", icon: BarChart3 },
  ];

  return (
    <aside className={`fixed top-0 ${isSideBarOpen ? 'left-0' : '-left-full'} lg:left-0 z-50 w-full lg:w-64 h-screen bg-[#F6F2FC] dark:bg-gray-900 border-r border-[#C8C4D5] dark:border-gray-700 lg:flex flex-col justify-between p-6 shrink-0 transition-all duration-500`}>
      <XIcon onClick={() => setIsSideBarOpen(false)} className="absolute top-4 right-2 block lg:hidden dark:text-gray-300" />
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1F108E] rounded-xl flex items-center justify-center text-white">
            <FolderKanban className="w-5 h-5 rotate-12" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#100752] dark:text-gray-100 leading-tight">Kortex</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Project Management</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link href={`${item.link}`}
                key={index}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  item.link === path
                    ? "bg-[#D6E4FF] dark:bg-[#1F108E]/20 text-[#1F108E] dark:text-indigo-300"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                <Icon className={`w-5 h-5 ${item.link === path ? "text-[#1F108E] dark:text-indigo-300" : "text-gray-400 dark:text-gray-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* <div className="flex flex-col gap-4"> */}
        {/* <button className="w-full bg-[#1F108E] hover:bg-[#100752] text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold shadow-md transition-all">
          <PlusCircle className="w-4 h-4" />
          Novo Projeto
        </button> */}

        <button
          onClick={async () => {
            await logoutAction();
            router.push("/");
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all w-fit cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      {/* </div> */}
    </aside>
  );
}