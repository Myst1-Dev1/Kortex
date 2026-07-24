"use client";

import { useActionState, useEffect, useRef } from "react";
import { Modal } from "@/components/modal";
import { Spinner } from "@/components/ui/spinner";
import { updateProjectAction, Project } from "@/lib/actions/projects";

interface EditProjectModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  project: Project;
  onUpdated: () => void;
}

const initialState = { success: null, error: null, data: null };

export function EditProjectModal({
  isOpen,
  setIsOpen,
  project,
  onUpdated,
}: EditProjectModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    handleSubmit,
    initialState
  );

  async function handleSubmit(_: any, formData: FormData) {
    const result = await updateProjectAction(project.id, _, formData);
    if (result.success === true) {
      setIsOpen(false);
      onUpdated();
    }
    return result;
  }

  useEffect(() => {
    if (state?.success === true) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Modal maxWidth="max-w-md" isOpenModal={isOpen} setIsOpenModal={setIsOpen}>
      <h1 className="text-center text-2xl font-bold dark:text-gray-100">Editar Projeto</h1>
      <form ref={formRef} action={formAction} className="space-y-4 mt-10">
        <div className="space-y-2">
          <label
            htmlFor="edit-name"
            className="flex items-center gap-1.5 text-sm font-medium text-[#464553]"
          >
            Nome do projeto
          </label>
          <input
            id="edit-name"
            name="name"
            type="text"
            defaultValue={project.name}
            className="p-3 w-full outline-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 transition-all duration-500 focus-visible:ring-1 focus-visible:ring-zinc-400"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-description"
            className="flex items-center gap-1.5 text-sm font-medium text-[#464553]"
          >
            Descrição
          </label>
          <textarea
            id="edit-description"
            name="description"
            rows={4}
            defaultValue={project.description ?? ""}
            className="p-3 w-full outline-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 transition-all duration-500 focus-visible:ring-1 focus-visible:ring-zinc-400 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-deadline"
            className="flex items-center gap-1.5 text-sm font-medium text-[#464553]"
          >
            Prazo
          </label>
          <input
            id="edit-deadline"
            name="deadline_for_completion"
            type="date"
            defaultValue={
              project.deadline_for_completion
                ? new Date(project.deadline_for_completion)
                    .toISOString()
                    .split("T")[0]
                : ""
            }
            className="p-3 w-full outline-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 transition-all duration-500 focus-visible:ring-1 focus-visible:ring-zinc-400"
          />
        </div>

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
          {pending ? <Spinner size={20} className="text-white" /> : "Salvar"}
        </button>
      </form>
    </Modal>
  );
}
