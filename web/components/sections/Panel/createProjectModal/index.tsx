import React from "react";

import { Modal } from "@/components/modal";
import { Input } from "@/components/ui/input";

interface CreateProjectModalProps {
    isOpenModal:boolean;
    setIsOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CreateProjectModal({ isOpenModal, setIsOpenModal }:CreateProjectModalProps) {
    return (
        <>
            <Modal maxWidth="max-w-md" isOpenModal={isOpenModal} setIsOpenModal={setIsOpenModal}>
                <h1 className="text-2xl font-semibold">Criar novo projeto</h1>

                <form action="" className="space-y-5 w-full mt-7 mb-3">
                    <div className="space-y-2">
                        <label htmlFor="project_name" className="flex items-center gap-1.5 text-sm font-medium text-[#464553]">
                            Nome do projeto
                        </label>
                        <div className="relative">
                            <Input 
                                id="project_name" 
                                name="project_name" 
                                type="text" 
                                placeholder="Site de receitas" 
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="project_description" className="flex items-center gap-1.5 text-sm font-medium text-[#464553]">
                            Descrição do projeto
                        </label>
                        <div className="relative">
                            <textarea 
                                id="project_description" 
                                name="project_description" 
                                rows={3}
                                placeholder="Será um site com foco..." 
                                className="w-full bg-[#FAFAFE] border border-[#EAE8F2] rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1F108E] focus:ring-1 focus:ring-[#1F108E] transition-all duration-200 resize-none"
                            />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <label htmlFor="project_date" className="flex items-center gap-1.5 text-sm font-medium text-[#464553]">
                            Data para conclusão do projeto
                        </label>
                        <div className="relative">
                            <Input 
                                id="project_date" 
                                name="project_date" 
                                type="date"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-[#1F108E] text-white py-3 rounded-xl cursor-pointer hover:bg-[#100752] font-semibold text-lg flex items-center justify-center gap-2 transition-all"
                    >
                        Criar 
                    </button>
                </form>
            </Modal>
        </>
    )
}