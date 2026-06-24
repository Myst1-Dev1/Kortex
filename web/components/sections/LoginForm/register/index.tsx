/* eslint-disable @typescript-eslint/no-explicit-any */

import { Input } from "@/components/ui/input";
import Image from "next/image";

interface RegisterProps {
    setActiveForm: any;
}

export function Register({ setActiveForm }:RegisterProps) {
    return (
        <>
            <form action="" className="w-full max-w-md mt-7 space-y-5">
                <div className="space-y-4 grid place-items-center grid-cols-1">
                    <Image src='/images/uploadImage.png' className="rounded-full w-32 object-cover aspect-square" width={200} height={200} alt="foto de usuário" />
                    <label className="cursor-pointer" htmlFor="file">Envie uma imagem</label>
                    <input type="file" name="file" id="file" className="hidden" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium text-[#464553]">
                            <span className="text-xs">✉</span> Nome de usuário
                        </label>
                        <div className="relative">
                            <Input 
                                id="name" 
                                name="name" 
                                type="text" 
                                placeholder="John Doe" 
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium text-[#464553]">
                            <span className="text-xs">✉</span> E-mail
                        </label>
                        <div className="relative">
                            <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            placeholder="nome@kortex.com" 
                            />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label htmlFor="password" className="flex items-center gap-1.5 text-sm font-medium text-[#464553]">
                            <span className="text-xs">🔒</span> Senha
                        </label>
                        <div className="relative flex items-center">
                            <Input 
                                id="password" 
                                name="password" 
                                type="password" 
                                placeholder="••••••••" 
                            />
                            <span className="absolute right-3 text-gray-500 cursor-pointer text-sm">👁</span>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="confirmPassword" className="flex items-center gap-1.5 text-sm font-medium text-[#464553]">
                            <span className="text-xs">🔒</span>Confirme a Senha
                        </label>
                        <div className="relative flex items-center">
                            <Input 
                                id="confirmPassword" 
                                name="confirmPassword" 
                                type="password" 
                                placeholder="••••••••" 
                            />
                            <span className="absolute right-3 text-gray-500 cursor-pointer text-sm">👁</span>
                        </div>
                    </div>
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-[#1F108E] text-white py-3 rounded-xl cursor-pointer hover:bg-violet-700 font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-500"
                >
                    Cadastrar <span>➔</span>
                </button>
            </form>

            <div className="relative flex py-5 items-center justify-center">
                <div className="text-center mt-8 text-sm text-gray-500">
                    Já possui uma conta?{' '}
                    <span onClick={() => setActiveForm('login')} className="text-[#1F108E] font-medium cursor-pointer hover:underline">
                        Entrar
                    </span>
                </div>
            </div>
        </>
    )
}