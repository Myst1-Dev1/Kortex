'use server';

import { ProjectsContent } from "@/components/sections/ProjectsContent";
import { getAllProjectsAction } from "@/lib/actions/projects";

export default async function ProjectsPage() {
    const data = await getAllProjectsAction();

    console.log(data.data);

    return <ProjectsContent data={data} />;
}
