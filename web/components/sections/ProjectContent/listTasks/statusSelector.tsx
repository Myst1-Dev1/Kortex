"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { updateTaskStatusAction } from "@/lib/actions/tasks";

const STATUSES = [
  { value: "PENDING", label: "Pendente", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { value: "TODO", label: "A Fazer", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "IN_PROGRESS", label: "Em Andamento", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "REVIEW", label: "Revisão", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "DONE", label: "Concluído", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

interface StatusSelectorProps {
  taskId: string;
  currentStatus: string;
  onStatusChanged: () => void;
}

export function StatusSelector({
  taskId,
  currentStatus,
  onStatusChanged,
}: StatusSelectorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = STATUSES.find((s) => s.value === currentStatus) ?? STATUSES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = async (status: string) => {
    if (status === currentStatus) {
      setOpen(false);
      return;
    }
    setLoading(true);
    const result = await updateTaskStatusAction(taskId, status);
    setLoading(false);
    setOpen(false);
    if (result.success) {
      onStatusChanged();
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        disabled={loading}
        className={`
          flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase
          tracking-wider border transition-all cursor-pointer disabled:opacity-50
          ${current.color}
        `}
      >
        {loading ? "..." : current.label}
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg py-1 min-w-[150px]">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => handleChange(s.value)}
              className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                s.value === currentStatus ? "text-[#1F108E] font-bold" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
