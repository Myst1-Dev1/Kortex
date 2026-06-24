import { LoginForm } from "@/components/sections/LoginForm";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="flex justify-between items-stretch min-h-screen w-full">
        
        <div className="hidden lg:flex lg:w-1/2 min-h-screen relative flex-col justify-end p-12 overflow-hidden">
          <Image 
            src="/images/login-bg.png" 
            alt="Fundo Kortex" 
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#1F108E]/90 mix-blend-multiply z-10"></div>
          <div className="absolute inset-0 bg-linear-to-t from-[#100752] via-transparent to-transparent z-15 opacity-80"></div>
          
          <div className="relative z-20 max-w-xl space-y-4 mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Foque no que <br /> importa.
            </h2>
            <p className="text-base lg:text-lg text-white/80 font-normal max-w-md antialiased">
              Kortex otimiza seus projetos de alta velocidade com precisão e clareza profissional.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <LoginForm />
        </div>

      </div>
    </>
  );
}
