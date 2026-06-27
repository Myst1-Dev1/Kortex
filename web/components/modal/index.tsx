'use client';

import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { XIcon } from "lucide-react";

interface ModalProps {
    maxWidth: string;
    isOpenModal: boolean;
    setIsOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
    children: React.ReactNode
}

export function Modal({ maxWidth, isOpenModal, setIsOpenModal, children }: ModalProps) {
    useGSAP(() => {
        if (isOpenModal) {
            gsap.fromTo(".modal-body", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" });
        }
    }, [isOpenModal]);

    return (
        <>
        {isOpenModal &&
            <div onClick={() => setIsOpenModal(false)} className="modal-container fixed z-50 top-0 left-0 right-0 w-full min-h-screen bg-black/40">
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className={`modal-body rounded-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 ${maxWidth} w-full`}>
                    <div onClick={() => setIsOpenModal(false)} className="w-7 h-7 bg-[#1F108E] text-white grid place-items-center rounded-full absolute top-5 right-5 cursor-pointer transition-all duration-500 hover:bg-[#100752]">
                        <XIcon className="w-6 h-6" />
                    </div>
                    
                    {children}
                </div>
            </div>
        }
        </>
    )
}