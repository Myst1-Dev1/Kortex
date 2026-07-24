'use server';

import { TasksContent } from "@/components/sections/TasksContent";
import { getAllProjectsAction, Project } from "@/lib/actions/projects";
import { getTasksByProjectAction, Task } from "@/lib/actions/tasks";

export default async function TasksPage() {
    const projectResult = await getAllProjectsAction();
    const projects: Project[] = projectResult.success ? projectResult.data : [];

    let allTasks: Task[] = [];
    const projectMap: Record<string, string> = {};

    for (const project of projects) {
        projectMap[project.id] = project.name;
        const taskResult = await getTasksByProjectAction(project.id);
        if (taskResult.success) {
            allTasks = allTasks.concat(taskResult.data);
        }
    }

    return <TasksContent tasks={allTasks} projectMap={projectMap} />;
}
