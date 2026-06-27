import { Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function TasksAndProjects() {
    return (
        <>
            <div className="mt-10 grid grid-cols-2 gap-10 lg:gap-0 place-items-center lg:grid-cols-3 2xl:grid-cols-4">
                <div className="bg-white border border-[#F1F0F7] shadow-sm max-w-80 w-full rounded-xl p-4">
                    <div className="flex justify-between items-center w-full">
                        <div className="w-10 h-10 rounded-md grid place-items-center bg-[#F5F4FA]"><Star className="text-[#1F108E] w-5 h-5" /></div>
                        <span className="bg-[#F0FDF4] font-bold uppercase text-[#15803D] rounded-full py-2 px-5 border border-[#DCFCE7] text-sm">ativo</span>
                    </div>
                    <h3 className="text-xl font-semibold my-2">Redesign Plataforma SaaS</h3>
                    <p className="text-sm text-gray-400">Lorem ipsum dolor sit amet,
                        consectetur adipiscing elit. Sed do…
                    </p>
                    <div className="mt-10 border-t border-gray-200">
                        <div className="mt-5 flex items-center justify-between">
                            <div className="flex -space-x-2.5 items-center">
                                <Image 
                                    className="w-9 h-9 object-cover rounded-full border-2 border-white z-0" 
                                    src='/images/userImg.jpg' 
                                    width={32} 
                                    height={32} 
                                    alt="participante do projeto" 
                                />
                                <Image 
                                    className="w-9 h-9 object-cover rounded-full border-2 border-white z-10" 
                                    src='/images/userImg.jpg' 
                                    width={32} 
                                    height={32} 
                                    alt="participante do projeto" 
                                />
                                <Image 
                                    className="w-9 h-9 object-cover rounded-full border-2 border-white z-20" 
                                    src='/images/userImg.jpg' 
                                    width={32} 
                                    height={32} 
                                    alt="participante do projeto" 
                                />
                                

                                <div className="w-9 h-9 rounded-full border-2 border-white bg-[#EAE8F2] flex items-center justify-center z-30 text-xs font-bold text-[#4A4A68]">
                                    +2
                                </div>
                            </div>
                            <Link href="/project/1" className="cursor-pointer p-3 font-bold text-base text-[#1F108E] border border-[#1F108E]/20 rounded-xl transition-all duration-500 hover:bg-[#100752] hover:text-white">Ver Projeto</Link>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-[#F1F0F7] shadow-sm max-w-80 w-full rounded-xl p-4">
                    <div className="flex justify-between items-center w-full">
                        <div className="w-10 h-10 rounded-md grid place-items-center bg-[#F5F4FA]"><Star className="text-[#1F108E] w-5 h-5" /></div>
                        <span className="bg-[#F0FDF4] font-bold uppercase text-[#15803D] rounded-full py-2 px-5 border border-[#DCFCE7] text-sm">ativo</span>
                    </div>
                    <h3 className="text-xl font-semibold my-2">Redesign Plataforma SaaS</h3>
                    <p className="text-sm text-gray-400">Lorem ipsum dolor sit amet,
                        consectetur adipiscing elit. Sed do…
                    </p>
                    <div className="mt-10 border-t border-gray-200">
                        <div className="mt-5 flex items-center justify-between">
                            <div className="flex -space-x-2.5 items-center">
                                <Image 
                                    className="w-9 h-9 object-cover rounded-full border-2 border-white z-0" 
                                    src='/images/userImg.jpg' 
                                    width={32} 
                                    height={32} 
                                    alt="participante do projeto" 
                                />
                                <Image 
                                    className="w-9 h-9 object-cover rounded-full border-2 border-white z-10" 
                                    src='/images/userImg.jpg' 
                                    width={32} 
                                    height={32} 
                                    alt="participante do projeto" 
                                />
                                <Image 
                                    className="w-9 h-9 object-cover rounded-full border-2 border-white z-20" 
                                    src='/images/userImg.jpg' 
                                    width={32} 
                                    height={32} 
                                    alt="participante do projeto" 
                                />
                                

                                <div className="w-9 h-9 rounded-full border-2 border-white bg-[#EAE8F2] flex items-center justify-center z-30 text-xs font-bold text-[#4A4A68]">
                                    +2
                                </div>
                            </div>
                            <Link href="/project/1" className="cursor-pointer p-3 font-bold text-base text-[#1F108E] border border-[#1F108E]/20 rounded-xl transition-all duration-500 hover:bg-[#100752] hover:text-white">Ver Projeto</Link>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-[#F1F0F7] shadow-sm max-w-80 w-full rounded-xl p-4">
                    <div className="flex justify-between items-center w-full">
                        <div className="w-10 h-10 rounded-md grid place-items-center bg-[#F5F4FA]"><Star className="text-[#1F108E] w-5 h-5" /></div>
                        <span className="bg-[#F0FDF4] font-bold uppercase text-[#15803D] rounded-full py-2 px-5 border border-[#DCFCE7] text-sm">ativo</span>
                    </div>
                    <h3 className="text-xl font-semibold my-2">Redesign Plataforma SaaS</h3>
                    <p className="text-sm text-gray-400">Lorem ipsum dolor sit amet,
                        consectetur adipiscing elit. Sed do…
                    </p>
                    <div className="mt-10 border-t border-gray-200">
                        <div className="mt-5 flex items-center justify-between">
                            <div className="flex -space-x-2.5 items-center">
                                <Image 
                                    className="w-9 h-9 object-cover rounded-full border-2 border-white z-0" 
                                    src='/images/userImg.jpg' 
                                    width={32} 
                                    height={32} 
                                    alt="participante do projeto" 
                                />
                                <Image 
                                    className="w-9 h-9 object-cover rounded-full border-2 border-white z-10" 
                                    src='/images/userImg.jpg' 
                                    width={32} 
                                    height={32} 
                                    alt="participante do projeto" 
                                />
                                <Image 
                                    className="w-9 h-9 object-cover rounded-full border-2 border-white z-20" 
                                    src='/images/userImg.jpg' 
                                    width={32} 
                                    height={32} 
                                    alt="participante do projeto" 
                                />
                                

                                <div className="w-9 h-9 rounded-full border-2 border-white bg-[#EAE8F2] flex items-center justify-center z-30 text-xs font-bold text-[#4A4A68]">
                                    +2
                                </div>
                            </div>
                            <Link href="/project/1" className="cursor-pointer p-3 font-bold text-base text-[#1F108E] border border-[#1F108E]/20 rounded-xl transition-all duration-500 hover:bg-[#100752] hover:text-white">Ver Projeto</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}