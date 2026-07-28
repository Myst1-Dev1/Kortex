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
                    <Link
                        key={project.id}
                        href={`/project/${project.id}`}
                        className="max-w-80 bg-white dark:bg-gray-800 border border-[#F1F0F7] dark:border-gray-700 shadow-sm rounded-xl p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-300 group"
                        >
                        <div className="flex justify-between items-center mb-3">
                            <div className="w-10 h-10 rounded-lg grid place-items-center bg-[#F5F4FA] dark:bg-gray-700 group-hover:bg-[#EAE8F2] transition-colors">
                            <Star className="text-[#1F108E] w-5 h-5" />
                            </div>
                            <span className="bg-[#F0FDF4] font-bold uppercase text-[#15803D] rounded-full py-1 px-3 border border-[#DCFCE7] text-[10px]">
                            ativo
                            </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1 truncate">
                            {project.name}
                        </h3>
                        <div
                            className="text-gray-400 dark:text-gray-500 text-sm font-light line-clamp-2 mb-4"
                            dangerouslySetInnerHTML={{ __html: project?.description ?? "" }}
                        />

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex items-center justify-between">
                            {project.participants && project.participants.length > 0 ? (
                            <div className="flex -space-x-2">
                                {project.participants.slice(0, 3).map((p: any, i: number) => (
                                <Image
                                    key={p.id || i}
                                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                                    style={{ zIndex: i * 10 }}
                                    src={p.avatarUrl || "/images/userImg.jpg"}
                                    width={28}
                                    height={28}
                                    alt={p.name || ""}
                                />
                                ))}
                                {project.participants.length > 3 && (
                                <div className="w-7 h-7 rounded-full border-2 border-white bg-[#EAE8F2] flex items-center justify-center text-[9px] font-bold text-[#4A4A68]">
                                    +{project.participants.length - 3}
                                </div>
                                )}
                            </div>
                            ) : (
                            <span className="text-xs text-gray-300">Sem participantes</span>
                            )}
                            <span className="text-xs font-medium text-blue-500 group-hover:underline">
                            Ver →
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    )
}