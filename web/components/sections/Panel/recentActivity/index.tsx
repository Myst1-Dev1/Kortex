"use client";

import { MoreVertical } from "lucide-react";
import { Task } from "@/lib/actions/tasks";
import { Project } from "@/lib/actions/projects";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: "bg-[#FFF2E0] text-[#9A5E00]" },
  TODO: { label: "A Fazer", color: "bg-[#F1F0F7] text-[#4A4A68]" },
  IN_PROGRESS: { label: "Em Andamento", color: "bg-[#E8E6F8] text-[#1F108E]" },
  REVIEW: { label: "Revisão", color: "bg-[#FFF2CC] text-[#7F6000]" },
  DONE: { label: "Concluído", color: "bg-[#F0FDF4] text-[#15803D]" },
};

interface RecentActivityProps {
  tasks?: Task[];
  projects?: Project[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-[#D6E4FF] text-[#1F108E]",
  "bg-[#E2F0D9] text-[#385723]",
  "bg-[#FFF2CC] text-[#7F6000]",
  "bg-[#F5D6E8] text-[#8B2252]",
  "bg-[#D4EDFC] text-[#1B5E8C]",
];

export function RecentActivity({ tasks = [], projects = [] }: RecentActivityProps) {
  const recentTasks = [...tasks]
    .sort((a, b) => {
      const dateA = a.updated_at || a.created_at || "";
      const dateB = b.updated_at || b.created_at || "";
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, 10);

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  if (recentTasks.length === 0) {
    return (
      <div className="my-10 w-full">
        <h2 className="font-medium text-xl mb-4">Atividade Recente</h2>
        <div className="w-full rounded-2xl border border-[#F1F0F7] dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 p-10 text-center text-sm text-gray-400">
          Nenhuma atividade recente
        </div>
      </div>
    );
  }

  return (
    <div className="my-10 w-full">
      <h2 className="font-medium text-xl mb-4 dark:text-gray-100">Atividade Recente</h2>

      <div className="w-full overflow-x-auto rounded-2xl border border-[#F1F0F7] dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
        <table className="w-full text-left border-collapse min-w-150">
          <thead>
            <tr className="bg-[#F5F4FA] dark:bg-gray-900">
              <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Tarefa</th>
              <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Projeto</th>
              <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Responsável</th>
              <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F1F0F7] dark:divide-gray-700">
            {recentTasks.map((task) => {
              const project = projectMap.get(task.project_id);
              const statusKey = (task.status || "PENDING").toUpperCase();
              const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;
              const colorIndex =
                (task.id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;

              return (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-5 px-6 text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {task.name}
                  </td>

                  <td className="py-5 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {project?.name ?? "Projeto"}
                  </td>

                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${AVATAR_COLORS[colorIndex]}`}
                      >
                        {getInitials("Responsável")}
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {task.assigned_user_id ? "Atribuído" : "Não atribuído"}
                      </span>
                    </div>
                  </td>

                  <td className="py-5 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
