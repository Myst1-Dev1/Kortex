"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Spinner } from "@/components/ui/spinner";
import { deleteProjectAction } from "@/lib/actions/projects";

interface ConfirmDeleteProjectModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectId: string;
  onDeleted: () => void;
}

export function ConfirmDeleteProjectModal({
  isOpen,
  setIsOpen,
  projectId,
  onDeleted,
}: ConfirmDeleteProjectModalProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setPending(true);
    setError(null);

    const result = await deleteProjectAction(projectId);

    if (result.success) {
      setIsOpen(false);
      onDeleted();
    } else {
      setError(result.error);
    }

    setPending(false);
  };

  return (
    <Modal maxWidth="max-w-sm" isOpenModal={isOpen} setIsOpenModal={setIsOpen}>
      <div className="text-center space-y-4 py-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Deletar Projeto</h1>
        <p className="text-sm text-gray-500">
          Tem certeza que deseja deletar este projeto? Esta ação não pode ser
          desfeita.
        </p>

        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setIsOpen(false)}
            disabled={pending}
            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-semibold text-sm cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={pending}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm cursor-pointer transition-all hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pending ? (
              <Spinner size={16} className="text-white" />
            ) : (
              "Deletar"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
