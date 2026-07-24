'use client';

import { useState } from "react";
import { SideBar } from "@/components/sideBar";
import { Header } from "@/components/header";
import { Task } from "@/lib/actions/tasks";
import { Project } from "@/lib/actions/projects";

interface ReportsContentProps {
  tasks: Task[];
  projects: Project[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pendente", color: "text-orange-600", bg: "bg-orange-500" },
  TODO: { label: "A Fazer", color: "text-slate-600", bg: "bg-slate-500" },
  IN_PROGRESS: { label: "Em Andamento", color: "text-blue-600", bg: "bg-blue-500" },
  REVIEW: { label: "Revisão", color: "text-amber-600", bg: "bg-amber-500" },
  DONE: { label: "Concluído", color: "text-emerald-600", bg: "bg-emerald-500" },
};

export function ReportsContent({ tasks, projects }: ReportsContentProps) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const statusCounts = tasks.reduce(
    (acc, t) => {
      const status = (t.status || "PENDING").toUpperCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const maxStatusCount = Math.max(...Object.values(statusCounts), 1);

  const totalEstimated = tasks.reduce((sum, t) => {
    const val = t.time_estimated ? parseInt(t.time_estimated, 10) : 0;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const totalConcluded = tasks.reduce((sum, t) => {
    const val = t.time_concluded ? parseInt(t.time_concluded, 10) : 0;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const projectStats = projects.map((p) => {
    const projectTasks = tasks.filter((t) => t.project_id === p.id);
    const done = projectTasks.filter((t) => t.status === "DONE").length;
    return {
      id: p.id,
      name: p.name,
      total: projectTasks.length,
      done,
      rate: projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0,
    };
  });

  const stats = [
    { label: "Total de Tarefas", value: totalTasks },
    { label: "Tarefas Concluídas", value: doneTasks },
    { label: "Taxa de Conclusão", value: `${completionRate}%` },
    { label: "Horas Estimadas", value: totalEstimated > 0 ? `${totalEstimated}h` : "—" },
    { label: "Horas Registradas", value: totalConcluded > 0 ? `${totalConcluded}h` : "—" },
  ];

  return (
    <div className="flex items-start w-full min-h-screen">
      <SideBar isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen} />

      <main className="ml-0 lg:ml-64 flex-1">
        <Header setIsSideBarOpen={setIsSideBarOpen} />
        <div className="p-3 lg:p-10">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">Relatórios</h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white dark:bg-gray-800 border border-[#F1F0F7] dark:border-gray-700 rounded-xl p-4 text-center shadow-sm"
              >
                <p className="text-2xl font-bold text-[#1F108E]">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              <div className="bg-white dark:bg-gray-800 border border-[#F1F0F7] dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Tarefas por Status</h2>
              <div className="flex flex-col gap-3">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                  const count = statusCounts[key] || 0;
                  const pct = maxStatusCount > 0 ? (count / maxStatusCount) * 100 : 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">{cfg.label}</span>
                        <span className={`${cfg.color} font-bold`}>{count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${cfg.bg} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

              <div className="bg-white dark:bg-gray-800 border border-[#F1F0F7] dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Resumo por Projeto</h2>
              {projectStats.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">Nenhum projeto encontrado</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {projectStats.map((p) => (
                    <div key={p.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400 font-medium truncate mr-2">{p.name}</span>
                        <span className="text-gray-400 shrink-0">
                          {p.done}/{p.total} ({p.rate}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1F108E] rounded-full transition-all duration-500"
                          style={{ width: `${p.rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
