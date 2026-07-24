'use client';

import { useState } from "react";
import Link from "next/link";
import { Search, Clock3Icon, CodeIcon } from "lucide-react";
import { SideBar } from "@/components/sideBar";
import { Header } from "@/components/header";
import { Task } from "@/lib/actions/tasks";
import { useUser } from "@/services/user";

interface TasksContentProps {
  tasks: Task[];
  projectMap: Record<string, string>;
}

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: "bg-orange-50 text-orange-700 border-orange-200" },
  TODO: { label: "A Fazer", color: "bg-slate-100 text-slate-700 border-slate-200" },
  IN_PROGRESS: { label: "Em Andamento", color: "bg-blue-50 text-blue-700 border-blue-200" },
  REVIEW: { label: "Revisão", color: "bg-amber-50 text-amber-700 border-amber-200" },
  DONE: { label: "Concluído", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const STATUSES = ["PENDING", "TODO", "IN_PROGRESS", "REVIEW", "DONE"];

export function TasksContent({ tasks, projectMap }: TasksContentProps) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { user } = useUser();

  const filtered = tasks
    .filter((t) => {
      if (statusFilter !== "ALL" && (t.status || "PENDING").toUpperCase() !== statusFilter) return false;
      if (search.trim()) return t.name.toLowerCase().includes(search.toLowerCase());
      return true;
    })
    .sort((a, b) => {
      const dateA = a.updated_at || a.created_at || "";
      const dateB = b.updated_at || b.created_at || "";
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    const taskIsMine = filtered.filter(id => id.assigned_user_id === user?.id);

  return (
    <div className="flex items-start w-full min-h-screen">
      <SideBar isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen} />

      <main className="ml-0 lg:ml-64 flex-1">
        <Header setIsSideBarOpen={setIsSideBarOpen} />
        <div className="p-3 lg:p-10">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Minhas Tarefas</h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar tarefa..."
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-[#1F108E] transition-colors w-full sm:w-56 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  statusFilter === "ALL"
                    ? "border-[#1F108E] bg-[#1F108E]/5 text-[#1F108E]"
                    : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                Todas
              </button>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    statusFilter === s
                      ? "border-[#1F108E] bg-[#1F108E]/5 text-[#1F108E]"
                      : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {STATUS_STYLES[s]?.label}
                </button>
              ))}
            </div>
          </div>

          {taskIsMine.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              {search || statusFilter !== "ALL" ? "Nenhuma tarefa encontrada" : "Você não possui tarefas"}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {taskIsMine.map((task) => {
                const statusKey = (task.status || "PENDING").toUpperCase();
                const status = STATUS_STYLES[statusKey] ?? STATUS_STYLES.PENDING;
                const projectName = projectMap[task.project_id] ?? "Projeto";

                return (
                  <Link
                    key={task.id}
                    href={`/project/${task.project_id}`}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <CodeIcon className="w-5 h-5 text-indigo-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-950 transition-colors truncate">
                        {task.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{projectName}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock3Icon className="w-3.5 h-3.5" />
                        <span>{task.time_estimated || "—"}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
