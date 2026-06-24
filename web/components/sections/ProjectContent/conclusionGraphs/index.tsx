

export function ConclusionGraphs() {
    const total = 20;
    const concluidas = 14;
    const porcentagem = Math.round((concluidas / total) * 100);

    const raio = 50;
    const circunferencia = 2 * Math.PI * raio;
    const strokeDashoffset = circunferencia - (porcentagem / 100) * circunferencia;
    
    const dadosGrafico = [
        { semana: "Sem 1", atual: 40, estimado: 70 },
        { semana: "Sem 2", atual: 75, estimado: 90 },
        { semana: "Sem 3", atual: 0,  estimado: 50 },
        { semana: "Sem 4", atual: 85, estimado: 100 },
        { semana: "Sem 5", atual: 0,  estimado: 65 },
    ];

    return (
        <>
            <div className="grid gap-10 lg:gap-0 w-full grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-1 bg-white rounded-2xl border border-[#EAE8F2] p-6 w-full lg:max-w-70 shadow-sm flex flex-col items-center">
                    <h3 className="text-gray-800 font-bold text-base lg:text-xl self-start mb-6">
                        Tarefas Concluídas
                    </h3>

                    <div className="relative flex items-center justify-center w-32 h-32 mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r={raio}
                            className="stroke-[#EAE8F2]"
                            strokeWidth="10"
                            fill="transparent"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r={raio}
                            className="stroke-[#1F108E] transition-all duration-500 ease-out"
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray={circunferencia}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                        </svg>

                        <div className="absolute text-center">
                            <span className="text-2xl font-bold text-[#100752]">{porcentagem}%</span>
                        </div>
                    </div>

                    <p className="text-sm font-medium text-gray-500">
                        {concluidas} de {total} concluídas
                    </p>
                </div>
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EAE8F2] p-6 w-full shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-gray-900 font-bold text-base lg:text-xl tracking-tight">
                            Tempo de Conclusão
                        </h3>
                        
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#1F108E]" />
                                <span>Atual</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#E6E4EC]" />
                                <span>Estimado</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4 items-end h-48 w-full px-2">
                        {dadosGrafico.map((dado, index) => (
                        <div key={index} className="flex flex-col items-center gap-3 h-full justify-end">
                            
                            <div 
                                className="w-full rounded-t-sm relative overflow-hidden bg-[#E6E4EC]"
                                style={{ height: `${dado.estimado}%` }}
                            >
                            {dado.atual > 0 && (
                                <div 
                                    className="absolute bottom-0 left-0 w-full bg-[#1F108E] transition-all duration-500"
                                    style={{ height: `${(dado.atual / dado.estimado) * 100}%` }}
                                />
                            )}
                            </div>

                            <span className="text-xs font-medium text-gray-400">
                                {dado.semana}
                            </span>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}