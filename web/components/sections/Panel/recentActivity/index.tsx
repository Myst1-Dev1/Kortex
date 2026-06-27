import { MoreVertical } from "lucide-react";

export function RecentActivity() {
    const activies = [
        {
        id: 1,
        tarefa: "Finalizar Wireframes Mobile",
        projeto: "Redesign SaaS",
        responsavel: "Arthur M.",
        avatarBg: "bg-[#D6E4FF] text-[#1F108E]",
        iniciais: "AM",
        status: "Em Andamento",
        statusColor: "bg-[#E8E6F8] text-[#1F108E]",
        },
        {
        id: 2,
        tarefa: "Ajustar endpoint de Checkout",
        projeto: "API Pagamentos",
        responsavel: "Lucas S.",
        avatarBg: "bg-[#E2F0D9] text-[#385723]",
        iniciais: "LS",
        status: "Revisão",
        statusColor: "bg-[#FFF2CC] text-[#7F6000]",
        },
    ];
    
    return (
        <>
            <div className="my-10 w-full">
                <h2 className="font-medium text-xl mb-4">Atividade Recente</h2>

                <div className="w-full overflow-x-auto rounded-2xl border border-[#F1F0F7] shadow-sm bg-white">
                    <table className="w-full text-left border-collapse min-w-150">
       
                        <thead>
                            <tr className="bg-[#F5F4FA]">
                            <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Tarefa</th>
                            <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Projeto</th>
                            <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Responsável</th>
                            <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Status</th>
                            <th className="py-4 px-6 w-10"></th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#F1F0F7]">
                            {activies.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                
                                <td className="py-5 px-6 text-sm font-semibold text-gray-800">
                                    {item.tarefa}
                                </td>

                                <td className="py-5 px-6 text-sm font-medium text-gray-500">
                                {item.projeto}
                                </td>
                                
                                <td className="py-5 px-6">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${item.avatarBg || "bg-gray-200 text-gray-600"}`}>
                                            {item.iniciais}
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">{item.responsavel}</span>
                                    </div>
                                </td>

                                <td className="py-5 px-6">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${item.statusColor}`}>
                                        {item.status}
                                    </span>
                                </td>

                                <td className="py-5 px-6 text-right">
                                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}