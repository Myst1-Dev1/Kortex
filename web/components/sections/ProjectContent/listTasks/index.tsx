import Image from "next/image";
import { Palette, Code2, FileText, SlidersHorizontal, Search } from "lucide-react";

export function ListTasks() {
  const tarefas = [
    {
      id: 1,
      titulo: "Ajustar paleta de cores do Dashboard",
      modificado: "Modificado há 2 horas",
      icon: Palette,
      iconBg: "bg-[#F0EEFC] text-[#1F108E]",
      status: "Em Progresso",
      statusColor: "bg-[#FFF2CC] text-[#B27D11]",
      avatar: "/images/userImg.jpg",
    },
    {
      id: 2,
      titulo: "Implementar micro-interações de hover",
      modificado: "Modificado há 1 dia",
      icon: Code2,
      iconBg: "bg-[#F0EEFC] text-[#1F108E]",
      status: "Concluído",
      statusColor: "bg-[#E2F6ED] text-[#22C55E]",
      avatar: "/images/userImg.jpg",
    },
    {
      id: 3,
      titulo: "Documentação de UI Kit",
      modificado: "Modificado há 3 dias",
      icon: FileText,
      iconBg: "bg-[#F0EEFC] text-[#1F108E]",
      status: "Em Progresso",
      statusColor: "bg-[#FFF2CC] text-[#B27D11]",
      avatar: "/images/userImg.jpg",
    },
  ];

  return (
    <div className="w-full bg-white p-6 border border-[#EAE8F2] rounded-xl my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl">Lista de Tarefas</h2>
        
        <div className="flex items-center gap-4 text-gray-500">
          <button className="hover:text-[#1F108E] transition-colors p-1">
            <SlidersHorizontal className="w-5 h-5 stroke-[1.5]" />
          </button>
          <button className="hover:text-[#1F108E] transition-colors p-1">
            <Search className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {tarefas.map((tarefa) => {
          const IconComponent = tarefa.icon;
          return (
            <div
              key={tarefa.id}
              className="w-full bg-[#FAFAFE] hover:bg-[#F4F3FA] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 border border-[#F1F0F7]/50"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tarefa.iconBg}`}>
                  <IconComponent className="w-5 h-5 stroke-2" />
                </div>
                
                <div className="truncate">
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 tracking-tight truncate">
                    {tarefa.titulo}
                  </h3>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">
                    {tarefa.modificado}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                <span className={`px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide ${tarefa.statusColor}`}>
                  {tarefa.status}
                </span>

                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 relative shrink-0">
                  <Image
                    src={tarefa.avatar}
                    alt="Responsável"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}