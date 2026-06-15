import { Input } from "@/components/ui/input";
import Image from "next/image";

export function LoginForm() {
    return (
        <>
            <div className="m-auto w-full lg:max-w-96 px-4 py-12 lg:py-0">
                <div className="flex flex-col items-center">
                    <Image 
                    src="/images/login-form-icon.png" 
                    alt="Kortex Logo" 
                    width={200} 
                    height={200} 
                    className="w-20 object-cover" 
                    />
                    <h1 className="text-3xl font-semibold text-[#1F108E] mt-2">Kortex</h1>
                    <p className="text-sm mt-2 text-[#464553] text-center">
                    Bem-vindo de volta à sua central de produtividade.
                    </p> 
                </div>
                <form className="w-full mt-7 space-y-5">
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

                    <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="flex items-center gap-1.5 text-sm font-medium text-[#464553]">
                        <span className="text-xs">🔒</span> Senha
                        </label>
                        <span className="text-[#1F108E] font-medium text-xs cursor-pointer hover:underline">
                        Esqueceu a senha?
                        </span>
                    </div>
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

                    <div className="flex items-center">
                    <input 
                        id="remember_me" 
                        name="remember_me" 
                        type="checkbox" 
                        className="h-4 w-4 text-[#1F108E] focus:ring-[#1F108E] border-gray-300 rounded cursor-pointer" 
                    />
                    <label htmlFor="remember_me" className="ml-2 block text-sm text-[#464553] cursor-pointer">
                        Lembrar de mim
                    </label>
                    </div>

                    <button 
                    type="submit" 
                    className="w-full bg-[#1F108E] text-white py-3 rounded-xl cursor-pointer hover:bg-opacity-90 font-semibold text-lg flex items-center justify-center gap-2 transition-all"
                    >
                    Entrar <span>➔</span>
                    </button>
                </form>

                <div className="relative flex py-5 items-center justify-center">
                    <div className="grow border-t border-gray-100"></div>
                    <span className="shrink mx-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
                    Ou entre com
                    </span>
                    <div className="grow border-t border-gray-100"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all">
                    <Image src="/images/google-icon.png" alt="Google" width={16} height={16} />
                    Google
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all">
                    <Image src="/images/linkedin-icon.png" alt="LinkedIn" width={16} height={16} />
                    LinkedIn
                    </button>
                </div>

                <div className="text-center mt-8 text-sm text-gray-500">
                    Não tem uma conta?{' '}
                    <span className="text-[#1F108E] font-medium cursor-pointer hover:underline">
                    Solicitar acesso
                    </span>
                </div>
            </div> 
        </>
    )
}