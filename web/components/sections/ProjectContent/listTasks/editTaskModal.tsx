"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/modal";
import { Spinner } from "@/components/ui/spinner";
import {
  updateTaskAction,
  updateTaskStatusAction,
  Task,
} from "@/lib/actions/tasks";
import { useUser } from "@/services/user";
import Image from "next/image";
import { Check } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface EditTaskModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  task: Task;
  participants?: Participant[];
  onUpdated: () => void;
}

const STATUSES = [
  { value: "PENDING", label: "Pendente" },
  { value: "TODO", label: "A Fazer" },
  { value: "IN_PROGRESS", label: "Em Andamento" },
  { value: "REVIEW", label: "Revisão" },
  { value: "DONE", label: "Concluído" },
];

export function EditTaskModal({
  isOpen,
  setIsOpen,
  task,
  participants = [],
  onUpdated,
}: EditTaskModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { user } = useUser();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    task.assigned_user_id ?? null
  );
  const [status, setStatus] = useState(
    (task.status || "PENDING").toUpperCase()
  );
  const [timeConcluded, setTimeConcluded] = useState(
    task.time_concluded ?? ""
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.id === task.task_author_id;
  const isParticipant = user?.id !== task.task_author_id;

  useEffect(() => {
    setSelectedUserId(task.assigned_user_id ?? null);
    setStatus((task.status || "PENDING").toUpperCase());
    setTimeConcluded(task.time_concluded ?? "");
    setError(null);
  }, [task.assigned_user_id, task.status, task.time_concluded, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    if (isAdmin) {
      const form = formRef.current;
      if (!form) {
        setPending(false);
        return;
      }

      const formData = new FormData(form);
      if (selectedUserId) {
        formData.set("assigned_user_id", selectedUserId);
      } else {
        formData.delete("assigned_user_id");
      }
      formData.set("status", status);
      if (timeConcluded) {
        formData.set("time_concluded", timeConcluded);
      }

      const result = await updateTaskAction(task.id, null as any, formData);

      setPending(false);
      if (result.success) {
        setIsOpen(false);
        onUpdated();
      } else {
        setError(result.error);
      }
    } else {
      const result = await updateTaskStatusAction(
        task.id,
        status,
        timeConcluded || undefined
      );

      setPending(false);
      if (result.success) {
        setIsOpen(false);
        onUpdated();
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <Modal maxWidth="max-w-md" isOpenModal={isOpen} setIsOpenModal={setIsOpen}>
      <h1 className="text-center text-2xl font-bold dark:text-gray-100">
        {isAdmin ? "Editar Tarefa" : "Atualizar Status"}
      </h1>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mt-10">
        {isAdmin && (
          <>
            <div className="space-y-2">
              <label
                htmlFor="edit-task-name"
                className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300"
              >
                Nome da tarefa
              </label>
              <input
                id="edit-task-name"
                name="name"
                type="text"
                defaultValue={task.name}
                className="p-3 w-full outline-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 transition-all duration-500 focus-visible:ring-1 focus-visible:ring-zinc-400"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-task-description"
                className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300"
              >
                Descrição
              </label>
              <textarea
                id="edit-task-description"
                name="description"
                rows={4}
                defaultValue={task.description ?? ""}
                className="p-3 w-full outline-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 transition-all duration-500 focus-visible:ring-1 focus-visible:ring-zinc-400 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-task-time"
                className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300"
              >
                Tempo estimado
              </label>
              <input
                id="edit-task-time"
                name="time_estimated"
                type="text"
                maxLength={5}
                defaultValue={task.time_estimated ?? ""}
                placeholder="00:00"
                className="p-3 w-full outline-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 transition-all duration-500 focus-visible:ring-1 focus-visible:ring-zinc-400"
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length > 2) {
                    value = value.replace(/(\d{2})(\d)/, "$1:$2");
                  }
                  e.target.value = value.slice(0, 5);
                }}
              />
            </div>

            {participants.length > 0 && (
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300">
                  Atribuir a
                </label>
                <div className="flex flex-wrap gap-2">
                  {participants.map((p) => {
                    const isSelected = selectedUserId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setSelectedUserId(isSelected ? null : p.id)
                        }
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer
                          ${
                            isSelected
                              ? "border-[#1F108E] dark:border-blue-500 bg-[#1F108E]/5 dark:bg-blue-500/5 dark:text-blue-400 text-[#1F108E]"
                              : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50"
                          }
                        `}
                      >
                        <div className="relative w-7 h-7 shrink-0">
                          <Image
                            src={p.avatarUrl || "/images/userImg.jpg"}
                            alt={p.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <span className="truncate max-w-[100px]">{p.name}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 dark:text-blue-400 text-[#1F108E] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {isParticipant && (
          <>
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value)}
                    className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
                      status === s.value
                        ? "border-[#1F108E] bg-[#1F108E]/5 text-[#1F108E]"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-task-time-concluded"
                className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300"
              >
                Tempo gasto
              </label>
              <input
                id="edit-task-time-concluded"
                type="text"
                maxLength={5}
                value={timeConcluded}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length > 2) {
                    value = value.replace(/(\d{2})(\d)/, "$1:$2");
                  }
                  setTimeConcluded(value.slice(0, 5));
                }}
                placeholder="00:00"
                className="p-3 w-full outline-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 transition-all duration-500 focus-visible:ring-1 focus-visible:ring-zinc-400"
              />
            </div>
          </>
        )}

        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-[#1F108E] text-white py-3 rounded-xl cursor-pointer hover:bg-[#100752] font-semibold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? (
            <Spinner size={20} className="text-white" />
          ) : (
            "Salvar"
          )}
        </button>
      </form>
    </Modal>
  );
}
