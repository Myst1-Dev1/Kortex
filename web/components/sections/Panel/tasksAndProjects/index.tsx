import { Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@/lib/actions/projects";

interface TasksAndProjectsProps {
    data: Project[] | any;
}

export function TasksAndProjects({ data }:TasksAndProjectsProps) {
    
    const projectsList = Array.isArray(data) 
        ? data 
        : (data && Array.isArray(data.data) ? data.data : []);

    console.log(data)

    if (projectsList.length === 0) {
        return (
            <div className="mt-10 text-center text-gray-500 font-medium">
                Você ainda não criou um projeto.
            </div>
        );
    }

    return (
        <>
            <div className="mt-10 grid grid-cols-2 gap-10 lg:gap-0 place-items-center lg:grid-cols-3 2xl:grid-cols-4">
                {projectsList?.map((project: any) => (
                    <div key={project.id} className="bg-white dark:bg-gray-800 border border-[#F1F0F7] dark:border-gray-700 shadow-sm max-w-80 w-full rounded-xl p-4">
                        <div className="flex justify-between items-center w-full">
                            <div className="w-10 h-10 rounded-md grid place-items-center bg-[#F5F4FA] dark:bg-gray-700"><Star className="text-[#1F108E] w-5 h-5" /></div>
                            <span className="bg-[#F0FDF4] font-bold uppercase text-[#15803D] rounded-full py-2 px-5 border border-[#DCFCE7] text-sm">ativo</span>
                        </div>
                        <h3 className="text-xl font-semibold my-2 dark:text-gray-100">{project.name}</h3>
                        <div
                            className="text-gray-400 dark:text-gray-500 text-sm font-light max-w-full break-words line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: project?.description ?? "" }}
                        />
                        <div className="mt-10 border-t border-gray-200 dark:border-gray-700">
                            <div className="mt-5 flex items-center justify-between">
                               {project.participants && project.participants.length > 0 && (
                                <div className="flex -space-x-2.5 items-center">
                                    {project.participants.slice(0, 3).map((participant:any, index: number) => (
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

                                    {project.participants.length > 3 && (
                                    <div 
                                        className="w-9 h-9 rounded-full border-2 border-white bg-[#EAE8F2] flex items-center justify-center text-xs font-bold text-[#4A4A68]"
                                        style={{ zIndex: 40 }}
                                    >
                                        +{project.participants.length - 3}
                                    </div>
                                    )}
                                </div>
                                )}
                                <Link href={`/project/${project.id}`} className="cursor-pointer p-3 font-bold text-base dark:text-blue-500 text-[#1F108E] border border-[#1F108E]/20 rounded-xl transition-all duration-500 hover:bg-[#100752] hover:text-white">Ver Projeto</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}