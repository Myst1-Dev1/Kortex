/* eslint-disable @typescript-eslint/no-empty-object-type */
'use client';

import React from "react";

// Estendemos diretamente os atributos nativos do input HTML
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// Utilizar forwardRef garante que você possa passar "ref" para o input (essencial para validações)
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", className = "", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        {...props}
        className={`bg-[#F5F4FF] border-none p-3 w-full rounded-md outline-none text-gray-700 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1F108E] ${className}`}
      />
    );
  }
);

Input.displayName = "Input";