'use server';

import { ProjectsContent } from "@/components/sections/ProjectsContent";
import { getAllProjectsAction } from "@/lib/actions/projects";

export default async function ProjectsPage() {
    const data = await getAllProjectsAction();

    if (!data.success) {
        return <div>Erro ao carregar projetos ou nenhum dado encontrado.</div>;
    }

    return <ProjectsContent data={data} />;
}
