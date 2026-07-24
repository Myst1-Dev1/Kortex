"use client";

import { useState } from "react";
import { Search, CodeIcon, Clock3Icon, PencilIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { Task } from "@/lib/actions/tasks";
import { EditTaskModal } from "./editTaskModal";
import { ConfirmDeleteTaskModal } from "./confirmDeleteTaskModal";
import { StatusSelector } from "./statusSelector";

interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface ListTasksProps {
  tasks: any;
  participants?: Participant[];
  onTaskChanged?: () => void;
}

export function ListTasks({ tasks, participants = [], onTaskChanged }: ListTasksProps) {
  const [search, setSearch] = useState("");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const stripHtml = (htmlString: string) => {
    if (!htmlString) return "Sem descrição";
    return htmlString.replace(/<[^>]*>/g, "");
  };

  const findParticipant = (userId: string) =>
    participants.find((p) => p.id === userId);

  const allTasks: Task[] = tasks?.data ?? [];
  const filteredTasks = search.trim()
    ? allTasks.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      )
    : allTasks;

  const openEdit = (task: Task) => {
    setEditTask(task);
    setIsEditOpen(true);
  };

  const openDelete = (task: Task) => {
    setDeleteTask(task);
    setIsDeleteOpen(true);
  };

  return (
    <>
      <div className="w-full bg-white dark:bg-gray-800 p-6 border border-[#EAE8F2] dark:border-gray-700 rounded-xl my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl dark:text-gray-100">Lista de Tarefas</h2>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tarefa..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-[#1F108E] transition-colors w-48 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3.5 mx-auto w-full p-4">
          {filteredTasks.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              {search ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa criada"}
            </p>
          )}

          {filteredTasks.map((task: Task) => {
            const statusKey = (task.status || "").toUpperCase();
            const assigned = task.assigned_user_id
              ? findParticipant(task.assigned_user_id)
              : null;

            return (
              <div
                key={task.id}
                className="
                  group
                  relative
                  w-full
                  bg-white dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-2xl
                  p-5
                  shadow-sm
                  hover:shadow-md
                  hover:border-indigo-200
                  transition-all
                  duration-300
                  overflow-hidden
                "
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 rounded-l-2xl" />

                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="
                        w-11 h-11 rounded-xl
                        bg-gradient-to-br from-indigo-50 to-violet-100
                        flex items-center justify-center shrink-0
                        transition-transform duration-300 group-hover:scale-105
                      "
                    >
                      <CodeIcon className="w-5 h-5 text-indigo-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-gray-100 text-base leading-tight group-hover:text-indigo-950 transition-colors">
                        {task.name}
                      </h3>

                      <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 line-clamp-1">
                        {stripHtml(task.description)}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-medium text-slate-400">
                        <div className="flex items-center gap-1.5 hover:text-slate-600 transition-colors">
                          <Clock3Icon className="w-4 h-4 text-slate-400" />
                          <span>{task.time_estimated || "00:00"}</span>
                        </div>

                        {assigned ? (
                          <div className="flex items-center gap-1.5 hover:text-slate-600 transition-colors">
                            <div className="relative w-5 h-5 shrink-0">
                              <Image
                                src={assigned.avatarUrl || "/images/userImg.jpg"}
                                alt={assigned.name}
                                fill
                                className="rounded-full object-cover"
                              />
                            </div>
                            <span>{assigned.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-300 dark:text-gray-500">
                            <span>Não atribuído</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusSelector
                      taskId={task.id}
                      currentStatus={statusKey}
                      onStatusChanged={() => onTaskChanged?.()}
                    />

                    <button
                      onClick={() => openEdit(task)}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openDelete(task)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Deletar"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editTask && (
        <EditTaskModal
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          task={editTask}
          participants={participants}
          onUpdated={() => {
            setEditTask(null);
            onTaskChanged?.();
          }}
        />
      )}

      {deleteTask && (
        <ConfirmDeleteTaskModal
          isOpen={isDeleteOpen}
          setIsOpen={setIsDeleteOpen}
          taskId={deleteTask.id}
          taskName={deleteTask.name}
          onDeleted={() => {
            setDeleteTask(null);
            onTaskChanged?.();
          }}
        />
      )}
    </>
  );
}
