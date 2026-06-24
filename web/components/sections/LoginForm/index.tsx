'use client';

import Image from "next/image";
import { useState } from "react";
import { Login } from "./login";
import { Register } from "./register";

export function LoginForm() {
    const [activeForm, setActiveForm] = useState('login');

    return (
        <>
            <div className="m-auto w-full lg:max-w-md px-4 py-12 mt-6 lg:py-0">
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

                {activeForm === 'login' ? <Login setActiveForm={setActiveForm} /> : <Register setActiveForm={setActiveForm} />}
            </div> 
        </>
    )
}