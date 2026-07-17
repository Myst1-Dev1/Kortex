'use server';

import { ProjectContent } from "@/components/sections/ProjectContent";
import { getProjectByIdAction } from "@/lib/actions/projects";
import { getTasksByProjectAction } from "@/lib/actions/tasks";

export default async function Project({ params }: any) {
    const { id } = await params;

    const data = await getProjectByIdAction(id);

    const tasks = await getTasksByProjectAction(id);

    return (
        <>
            <ProjectContent data = { data } tasks = {tasks} />
        </>
    )
}