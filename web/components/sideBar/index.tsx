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

interface SideBarProps {
  isSideBarOpen: boolean;
  setIsSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SideBar({ isSideBarOpen, setIsSideBarOpen }:SideBarProps) {
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, active: true },
    { name: "Projetos", icon: FolderKanban, active: false },
    { name: "Tarefas", icon: CheckSquare, active: false },
    { name: "Equipe", icon: Users2, active: false },
    { name: "Relatórios", icon: BarChart3, active: false },
  ];

  return (
    <aside className={`fixed top-0 ${isSideBarOpen ? 'left-0' : '-left-full'} lg:left-0 z-50 w-full lg:w-64 h-screen bg-[#F6F2FC] border-r border-[#C8C4D5] lg:flex flex-col justify-between p-6 shrink-0 transition-all duration-500`}>
      <XIcon onClick={() => setIsSideBarOpen(false)} className="absolute top-4 right-2 block lg:hidden" />
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1F108E] rounded-xl flex items-center justify-center text-white">
            <FolderKanban className="w-5 h-5 rotate-12" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#100752] leading-tight">Kortex</h2>
            <p className="text-xs text-gray-500 font-medium">Project Management</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  item.active
                    ? "bg-[#D6E4FF] text-[#1F108E]"
                    : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-700"
                }`}
              >
                <Icon className={`w-5 h-5 ${item.active ? "text-[#1F108E]" : "text-gray-400"}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* <div className="flex flex-col gap-4"> */}
        {/* <button className="w-full bg-[#1F108E] hover:bg-[#100752] text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold shadow-md transition-all">
          <PlusCircle className="w-4 h-4" />
          Novo Projeto
        </button> */}

        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all w-fit">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      {/* </div> */}
    </aside>
  );
}