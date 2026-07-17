import { Search, CodeIcon, Clock3Icon, ArrowRightIcon } from "lucide-react";
import Image from "next/image";

interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface ListTasksProps {
  tasks: any;
  participants?: Participant[];
}

const STATUS_STYLES: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700 border-slate-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  DONE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-orange-50 text-orange-700 border-orange-200",
};

export function ListTasks({ tasks, participants = [] }: ListTasksProps) {
  const stripHtml = (htmlString: string) => {
    if (!htmlString) return "Sem descrição";
    return htmlString.replace(/<[^>]*>/g, "");
  };

  const findParticipant = (userId: string) =>
    participants.find((p) => p.id === userId);

  return (
    <div className="w-full bg-white p-6 border border-[#EAE8F2] rounded-xl my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl">Lista de Tarefas</h2>

        <button className="hover:text-[#1F108E] transition-colors p-1">
          <Search className="w-5 h-5 stroke-[1.5]" />
        </button>
      </div>

      <div className="flex flex-col gap-3.5 mx-auto w-full p-4">
        {tasks?.data?.map((task: any) => {
          const statusKey = (task.status || "").toUpperCase();
          const badgeClass =
            STATUS_STYLES[statusKey] || "bg-slate-100 text-slate-700 border-slate-200";
          const assigned = task.assigned_user_id
            ? findParticipant(task.assigned_user_id)
            : null;

          return (
            <div
              key={task.id}
              className="
                group
                relative
                w-full
                bg-white
                border border-gray-200
                rounded-2xl
                p-5
                shadow-sm
                hover:shadow-md
                hover:border-indigo-200
                transition-all
                duration-300
                cursor-pointer
                overflow-hidden
              "
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 rounded-l-2xl" />

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className="
                      w-11 h-11 rounded-xl
                      bg-gradient-to-br from-indigo-50 to-violet-100
                      flex items-center justify-center shrink-0
                      transition-transform duration-300 group-hover:scale-105
                    "
                  >
                    <CodeIcon className="w-5 h-5 text-indigo-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 text-base leading-tight group-hover:text-indigo-950 transition-colors">
                      {task.name}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                      {stripHtml(task.description)}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-medium text-slate-400">
                      <div className="flex items-center gap-1.5 hover:text-slate-600 transition-colors">
                        <Clock3Icon className="w-4 h-4 text-slate-400" />
                        <span>{task.time_estimated || "00:00"}</span>
                      </div>

                      {assigned ? (
                        <div className="flex items-center gap-1.5 hover:text-slate-600 transition-colors">
                          <div className="relative w-5 h-5 shrink-0">
                            <Image
                              src={assigned.avatarUrl || "/images/userImg.jpg"}
                              alt={assigned.name}
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                          <span>{assigned.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span>Não atribuído</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={`
                      px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase
                      tracking-wider border transition-colors ${badgeClass}
                    `}
                  >
                    {task.status}
                  </span>

                  <div className="p-1">
                    <ArrowRightIcon
                      className="
                        w-5 h-5 text-slate-300
                        transition-all duration-300
                        group-hover:text-indigo-600 group-hover:translate-x-1
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
