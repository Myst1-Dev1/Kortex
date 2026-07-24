'use server';

import { ReportsContent } from "@/components/sections/ReportsContent";
import { getAllProjectsAction, Project } from "@/lib/actions/projects";
import { getTasksByProjectAction, Task } from "@/lib/actions/tasks";

export default async function ReportsPage() {
    const projectResult = await getAllProjectsAction();
    const projects: Project[] = projectResult.success ? projectResult.data : [];

    let allTasks: Task[] = [];

    for (const project of projects) {
        const taskResult = await getTasksByProjectAction(project.id);
        if (taskResult.success) {
            allTasks = allTasks.concat(taskResult.data);
        }
    }

    return <ReportsContent tasks={allTasks} projects={projects} />;
}
