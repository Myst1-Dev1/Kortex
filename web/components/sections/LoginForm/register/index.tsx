/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { signUpAction } from "@/lib/actions/auth";
import Image from "next/image";

interface RegisterProps {
    setActiveForm: any;
}

const initialState = {
    success: false,
    error: undefined,
};

export function Register({ setActiveForm }: RegisterProps) {
    const [state, formAction, pending] = useActionState(handleRegister, initialState);
    const [file, setFile] = useState<File | null>(null);

    async function handleRegister(prevState: any, data: FormData) {
        const result = await signUpAction(prevState, data);

        if(result.success === true) {
            setActiveForm('login')
        } else {
            alert('Tivemos um erro na criação da conta, tente novamente!');
        }

        return result;
    }

    return (
        <>
            <form action={formAction} className="w-full max-w-md mt-7 space-y-5">
                <div className="space-y-4 grid place-items-center grid-cols-1">
                    <Image src={file ? URL.createObjectURL(file) : '/images/uploadImage.png'} className="rounded-full w-32 object-cover aspect-square" width={200} height={200} alt="foto de usuário" />
                    <label className="cursor-pointer" htmlFor="avatar">Envie uma imagem</label>
                    <input
                        type="file"
                        name="avatar"
                        id="avatar"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) {
                            setFile(selectedFile);
                        }
                        }}
                    />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300">
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
                        <label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300">
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
                        <label htmlFor="password" className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300">
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
                        <label htmlFor="confirmPassword" className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300">
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

                {state?.error && (
                    <p className="text-sm text-red-500" role="alert">
                        {state.error}
                    </p>
                )}

                <button 
                    type="submit" 
                    disabled={pending}
                    className="w-full bg-[#1F108E] text-white py-3 rounded-xl cursor-pointer hover:bg-violet-700 font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {pending ? (
                        <Spinner size={20} className="text-white" />
                    ) : (
                        <>Cadastrar <span>➔</span></>
                    )}
                </button>
            </form>

            <div className="relative flex py-5 items-center justify-center">
                <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                    Já possui uma conta?{' '}
                    <span onClick={() => setActiveForm('login')} className="text-[#1F108E] font-medium cursor-pointer hover:underline">
                        Entrar
                    </span>
                </div>
            </div>
        </>
    )
}
