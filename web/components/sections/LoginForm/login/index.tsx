/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { signInAction } from "@/lib/actions/auth";
import { signIn as nextAuthSignIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

interface LoginProps {
    setActiveForm: any;
}

const initialState = {
    success: false,
    error: undefined,
};

export function Login({ setActiveForm }: LoginProps) {
    const [state, formAction, pending] = useActionState(handleLogin, initialState);
    
    const router = useRouter()

    const [showPassword, setShowPassword] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
    const [oauthError, setOauthError] = useState<string | null>(null);

    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };

    async function handleLogin(prevState: any, formData: FormData) {
        const result = await signInAction(prevState, formData);
    
        if(result.success === true) {
            router.push('/dashboard');
        } else {
            alert('Tivemos um erro ao ao fazer o login, tente novamente!')
        }
        
        return result;
    }

    async function handleOAuth(provider: "google" | "github") {
        setOauthError(null);
        setOauthLoading(provider);

        try {
            const result = await nextAuthSignIn(provider, {
                callbackUrl: "/dashboard",
                redirect: false,
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            window.location.assign(result?.url ?? "/dashboard");
        } catch (err) {
            console.error("OAuth error:", err);

            setOauthError(
                "Falha ao iniciar login social. Tente novamente."
            );

            setOauthLoading(null);
        }
    }

    return (
        <>
            <form action={formAction} className="w-full mt-7 space-y-5">
                <div className="space-y-1.5">
                    <label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300">
                        <span className="text-xs"><Mail size={15} /></span> E-mail
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

                <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <label htmlFor="password" className="flex items-center gap-1.5 text-sm font-medium text-[#464553] dark:text-gray-300">
                    <span className="text-xs"><Lock size={15} /></span> Senha
                    </label>
                    <span className="text-[#1F108E] font-medium text-xs cursor-pointer hover:underline">
                    Esqueceu a senha?
                    </span>
                </div>
                <div className="relative flex items-center">
                    <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    />
                    <span onClick={togglePasswordVisibility} className="absolute right-3 text-gray-500 cursor-pointer text-sm">
                       {showPassword === true ? <EyeOff size={15} /> : <Eye size={15} /> } 
                    </span>
                </div>
                </div>

                <div className="flex items-center">
                <input 
                    id="remember_me" 
                    name="remember_me" 
                    type="checkbox" 
                    className="h-4 w-4 text-[#1F108E] focus:ring-[#1F108E] border-gray-300 rounded cursor-pointer" 
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-[#464553] dark:text-gray-300 cursor-pointer">
                    Lembrar de mim
                </label>
                </div>

                {state?.error && (
                    <p className="text-sm text-red-500" role="alert">
                        {state.error}
                    </p>
                )}

                <button 
                type="submit" 
                disabled={pending}
                className="w-full bg-[#1F108E] text-white py-3 rounded-xl cursor-pointer hover:bg-opacity-90 font-semibold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {pending ? (
                    <Spinner size={20} className="text-white" />
                ) : (
                    <>Entrar <span>➔</span></>
                )}
                </button>
            </form>

            <div className="relative flex py-5 items-center justify-center">
                <div className="grow border-t border-gray-100"></div>
                <span className="shrink mx-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
                Ou entre com
                </span>
                <div className="grow border-t border-gray-100"></div>
            </div>

            {oauthError && (
                <p className="text-sm text-red-500 text-center -mt-2 mb-2" role="alert">
                    {oauthError}
                </p>
            )}

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => handleOAuth("google")}
                    disabled={oauthLoading !== null || pending}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {oauthLoading === "google" ? (
                        <Spinner size={16} />
                    ) : (
                        <Image src="/images/google-logo.webp" alt="Google" width={16} height={16} />
                    )}
                    Google
                </button>
                <button
                    type="button"
                    onClick={() => handleOAuth("github")}
                    disabled={oauthLoading !== null || pending}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {oauthLoading === "github" ? (
                        <Spinner size={16} />
                    ) : (
                        <Image src="/images/github-logo.png" alt="Github" width={16} height={16} />
                    )}
                    Github
                </button>
            </div>

            <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                Não tem uma conta?{' '}
                <span onClick={() => setActiveForm('register')} className="text-[#1F108E] font-medium cursor-pointer hover:underline">
                    Solicitar acesso
                </span>
            </div>
        </>
    )
}
