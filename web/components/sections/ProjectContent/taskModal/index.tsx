"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/modal";
import { Spinner } from "@/components/ui/spinner";
import { createTaskAction } from "@/lib/actions/tasks";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import Image from "next/image";
import { Check } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface TaskModalProps {
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectId: string;
  participants?: Participant[];
}

const initialState = { success: null, error: null, data: null };

export function TaskModal({
  isTaskModalOpen,
  setIsTaskModalOpen,
  projectId,
  participants = [],
}: TaskModalProps) {
  const [state, formAction, pending] = useActionState(handleCreateTask, initialState);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  async function handleCreateTask(prevState: any, formData: FormData) {
    if (selectedUserId) {
      formData.set("assigned_user_id", selectedUserId);
    }

    const result = await createTaskAction(prevState, formData);

    if (result.success === true) {
      setSelectedUserId(null);
      setIsTaskModalOpen(false);
    } else {
      alert("Tivemos um erro ao criar a tarefa, tente novamente!");
    }

    return result;
  }

  return (
    <Modal maxWidth="max-w-md" isOpenModal={isTaskModalOpen} setIsOpenModal={setIsTaskModalOpen}>
      <h1 className="text-center text-2xl font-bold">Crie uma nova tarefa</h1>
      <form action={formAction} className="space-y-4 mt-10">
        <input type="hidden" name="project_id" value={projectId} readOnly />

        <div className="space-y-2">
          <label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium text-[#464553]">
            Nome da tarefa
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Desenvolver o front em react"
            className="p-3 w-full outline-none rounded-md border border-gray-300 placeholder:text-gray-400 transition-all duration-500 focus-visible:ring-1 focus-visible:ring-zinc-400"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="flex items-center gap-1.5 text-sm font-medium text-[#464553]">
            Descrição da tarefa
          </label>
          <SunEditor
            name="description"
            height="150"
            placeholder="Será um site com foco..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="time_estimated" className="flex items-center gap-1.5 text-sm font-medium text-[#464553]">
            Tempo estimado para conclusão
          </label>
          <input
            name="time_estimated"
            type="text"
            maxLength={5}
            placeholder="00:00"
            className="p-3 w-full outline-none rounded-md border border-gray-300 placeholder:text-gray-400 transition-all duration-500 focus-visible:ring-1 focus-visible:ring-zinc-400"
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
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#464553]">
              Atribuir a
            </label>
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => {
                const isSelected = selectedUserId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedUserId(isSelected ? null : p.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer
                      ${isSelected
                        ? "border-[#1F108E] bg-[#1F108E]/5 text-[#1F108E]"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
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
                    {isSelected && <Check className="w-4 h-4 text-[#1F108E] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {state?.error && (
          <p className="text-sm text-red-500" role="alert">
            {state.error}
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
            "Criar"
          )}
        </button>
      </form>
    </Modal>
  );
}
