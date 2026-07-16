'use client';

import { useState } from "react";

import { Header } from "@/components/header";
import { SideBar } from "@/components/sideBar";
import { ConclusionGraphs } from "./conclusionGraphs";
import { ListTasks } from "./listTasks";
import { ChatBtn } from "./chatBtn";
import { Calendar, Layers, Plus, Link2, Check } from "lucide-react";
import Image from "next/image";
import { inviteToProjectAction, Project } from "@/lib/actions/projects";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/services/user";

import DOMPurify from "dompurify";

interface ProjectContentProps {
    data: Project | any;
}

export function ProjectContent({ data }:ProjectContentProps) {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);

    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const { user } = useUser();
    const isAuthor = user?.id === data?.data?.author_id;

    console.log(data.data)

    const handleCopyLink = async () => {
        if (isGenerating) return;

        const projectId = data?.data?.id;
        if (!projectId) {
            alert("ID do projeto não encontrado.");
            return;
        }

        setIsGenerating(true);

        try {
            const result = await inviteToProjectAction(projectId);

            if (!result.success) {
                alert(result.error ?? "Erro ao gerar link de convite.");
                setIsGenerating(false);
                return;
            }

            let inviteUrl: string;

            if (typeof result.data === "string") {
                inviteUrl = result.data;
            } else {
                const inviteToken = result.data?.token || result.data?.code;
                if (!inviteToken) {
                    alert("O servidor não retornou um token de convite válido.");
                    setIsGenerating(false);
                    return;
                }
                inviteUrl = `${window.location.origin}/convites/${inviteToken}`;
            }

            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            alert("Link de convite copiado!");

            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Falha ao gerar/copiar o link: ', err);
            alert("Ocorreu um erro inesperado.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <div className="flex items-start w-full min-h-screen">
                <SideBar isSideBarOpen = {isSideBarOpen} setIsSideBarOpen = {setIsSideBarOpen} />

                <main className="ml-0 lg:ml-64 flex-1">
                    <Header setIsSideBarOpen = {setIsSideBarOpen} />
                    <div className="p-3 lg:p-10">
                        <div className="mb-10 mt-2 lg:-mt-4 w-full bg-[#FAFAFE] rounded-2xl border border-[#F1F0F7] p-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                            <div className="space-y-3 flex-1 min-w-0">
                                <h1 className="text-2xl lg:text-3xl font-extrabold text-[#100752] tracking-tight truncate">
                                    {data?.data?.name}
                                </h1>
                                
                                <div 
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(data?.data?.description ?? "")
                                    }}
                                    className="text-sm lg:text-base text-gray-500 font-medium w-full whitespace-pre-wrap break-all leading-relaxed"
                                />

                                {/* <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-gray-400"> */}
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs font-semibold text-gray-400">Prazo: {data?.data?.deadline_for_completion && 
                                            new Date(data.data.deadline_for_completion).toLocaleDateString('pt-BR', {
                                                day: 'numeric',
                                                month: 'long'
                                            })
                                        } 
                                        </span>
                                    </div>
                                    {/* <div className="flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-gray-400" />
                                        <span>Sprint 4</span>
                                    </div>
                                </div> */}
                            </div>
                            {isAuthor && (
                            <div className="flex flex-wrap items-center gap-4 xl:justify-end shrink-0">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-bold text-gray-400 break-words max-w-32 uppercase tracking-wider">
                                        {data?.data?.participants?.length > 0 ? 'Time do Projeto' : 'O projeto ainda não possui participantes'}
                                    </span>
                                    <div className="flex -space-x-2.5 items-center">
                                        {data?.data?.participants && data?.data?.participants.length > 0 && (
                                            <div className="flex -space-x-2.5 items-center">
                                                {data?.data?.participants.slice(0, 3).map((participant: any, index: number) => (
                                                    <Image
                                                        key={participant.id || index}
                                                        className="w-9 h-9 object-cover rounded-full border-2 border-white dynamic-z"
                                                        style={{ zIndex: index * 10 }} 
                                                        src={participant.avatarUrl || '/images/userImg.jpg'} 
                                                        width={32}
                                                        height={32}
                                                        alt={participant.name || "participante do projeto"}
                                                    />
                                                ))}
                            
                                                {data?.data?.participants.length > 3 && (
                                                    <div 
                                                        className="w-9 h-9 rounded-full border-2 border-white bg-[#EAE8F2] flex items-center justify-center text-xs font-bold text-[#4A4A68]"
                                                        style={{ zIndex: 40 }}
                                                    >
                                                        +{data?.data?.participants.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="hidden sm:block w-px h-10 bg-gray-200" />
                                <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
                                    <button 
                                        onClick={handleCopyLink}
                                        disabled={isGenerating}
                                        className={`h-12 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                                            copied 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-800'
                                        } ${isGenerating ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                        {isGenerating ? (
                                            <Spinner size={20} className="text-white" />
                                        ) : copied ? (
                                            <>
                                                <Check className="w-4 h-4 text-emerald-600 animate-bounce" />
                                                <span>Link Copiado!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Link2 className="w-4 h-4" />
                                                <span>Gerar Convite</span>
                                            </>
                                        )}
                                    </button>

                                    <button className="h-12 px-5 rounded-xl bg-[#1F108E] font-bold text-sm text-white cursor-pointer transition-all duration-300 hover:bg-[#100752] hover:shadow-lg hover:shadow-[#1f108e]/20 flex items-center gap-2 group shrink-0">
                                        <Plus className="w-5 h-5 font-bold transition-transform group-hover:rotate-90 duration-300" />
                                        <span>Criar Tarefa</span>
                                    </button>
                                </div>
                            </div>
                            )}
                        </div>
                        <ConclusionGraphs />
                        <ListTasks />
                    </div>
                </main>
            </div>
            <ChatBtn />
        </>
    )
}