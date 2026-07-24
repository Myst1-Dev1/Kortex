import { Task } from "@/lib/actions/tasks";

interface ConclusionGraphsProps {
  tasks?: Task[];
}

const STATUS_COUNTS: Record<string, string> = {
  DONE: "Concluído",
  IN_PROGRESS: "Em Andamento",
  REVIEW: "Revisão",
  TODO: "A Fazer",
  PENDING: "Pendente",
};

export function ConclusionGraphs({ tasks = [] }: ConclusionGraphsProps) {
  const total = tasks.length;
  const concluidas = tasks.filter(
    (t) => (t.status || "").toUpperCase() === "DONE"
  ).length;
  const porcentagem = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  const raio = 50;
  const circunferencia = 2 * Math.PI * raio;
  const strokeDashoffset =
    circunferencia - (porcentagem / 100) * circunferencia;

  const statusBuckets = Object.entries(STATUS_COUNTS).map(([key, label]) => ({
    key,
    label,
    count: tasks.filter((t) => (t.status || "").toUpperCase() === key).length,
  }));

  const maxCount = Math.max(...statusBuckets.map((b) => b.count), 1);

  const statusColors: Record<string, string> = {
    DONE: "bg-[#1F108E]",
    IN_PROGRESS: "bg-blue-500",
    REVIEW: "bg-amber-500",
    TODO: "bg-slate-400",
    PENDING: "bg-orange-400",
  };

  return (
    <div className="grid gap-10 lg:gap-0 w-full grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl border border-[#EAE8F2] dark:border-gray-700 p-6 w-full lg:max-w-70 shadow-sm flex flex-col items-center">
        <h3 className="text-gray-800 dark:text-gray-100 font-bold text-base lg:text-xl self-start mb-6">
          Tarefas Concluídas
        </h3>

        <div className="relative flex items-center justify-center w-32 h-32 mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={raio}
              className="stroke-[#EAE8F2] dark:stroke-gray-700"
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
            <span className="text-2xl font-bold text-[#100752] dark:text-indigo-300">
              {porcentagem}%
            </span>
          </div>
        </div>

        <p className="text-sm font-medium text-gray-500">
          {concluidas} de {total} concluídas
        </p>
      </div>

      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-[#EAE8F2] dark:border-gray-700 p-6 w-full shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-gray-900 dark:text-gray-100 font-bold text-base lg:text-xl tracking-tight">
            Tarefas por Status
          </h3>
        </div>

        {total === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">
            Nenhuma tarefa para exibir
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {statusBuckets.map((bucket) => (
              <div key={bucket.key} className="flex items-center gap-4">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-28 shrink-0">
                  {bucket.label}
                </span>
                <div className="flex-1 bg-[#F1F0F7] dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      statusColors[bucket.key] ?? "bg-gray-400"
                    }`}
                    style={{
                      width: `${(bucket.count / maxCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-8 text-right shrink-0">
                  {bucket.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
