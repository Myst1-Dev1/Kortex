"use client";

import { useActionState } from "react";
import { Modal } from "@/components/modal";
import { Spinner } from "@/components/ui/spinner";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { createProjectAction } from "@/lib/actions/projects";
import { useUser } from "@/services/user";

interface CreateProjectModalProps {
    isOpenModal: boolean;
    setIsOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const initialState = { success: null, error: null, data: null };

export function CreateProjectModal({ isOpenModal, setIsOpenModal }: CreateProjectModalProps) {
    const [state, formAction, pending] = useActionState(handleCreateProject, initialState);

    const { user } = useUser();


    async function handleCreateProject(prevState: any, formData: FormData) {
        const result = await createProjectAction(prevState, formData);

        if(result.success === true) {
            setIsOpenModal(false);
        } else {
            alert('Tivemos um erro ao criar um projeto, tente novamente!');
        }

        return result;
    }

    return (
        <>
            <Modal maxWidth="max-w-md" isOpenModal={isOpenModal} setIsOpenModal={setIsOpenModal}>
                <h1 className="text-2xl font-semibold dark:text-gray-100">Criar novo projeto</h1>

                <form action={formAction} className="space-y-5 w-full mt-7 mb-3">
                    <input type="text" name="author_id" className="hidden" value={user?.id} defaultValue={user?.id} readOnly />
                    <div className="space-y-2">
                        <label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300">
                            Nome do projeto
                        </label>
                        <div className="relative">
                            <input 
                                id="name" 
                                name="name" 
                                type="text" 
                                placeholder="Site de receitas"
                                className="p-3 w-full outline-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 transition-all duration-500 focus-visible:ring-1 focus-visible:ring-zinc-400"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="description" className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300">
                            Descrição do projeto
                        </label>
                        <div className="relative">
                            <TiptapEditor 
                                name="description" 
                                height={150}
                                placeholder="Será um site com foco..."
                            />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <label htmlFor="deadline_for_completion" className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300">
                            Data para conclusão do projeto
                        </label>
                        <div className="relative">
                            <input 
                                id="deadline_for_completion" 
                                name="deadline_for_completion" 
                                type="date"
                                className="p-3 w-full outline-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 transition-all duration-500 focus-visible:ring-1 focus-visible:ring-zinc-400"
                            />
                        </div>
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
                        {pending ? (
                            <Spinner size={20} className="text-white" />
                        ) : (
                            "Criar"
                        )}
                    </button>
                </form>
            </Modal>
        </>
    )
}
