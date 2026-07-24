'use server';

import { DashboardContent } from "@/components/sections/Panel/dashboardContent";
import { getAllProjectsAction, Project } from "@/lib/actions/projects";
import { getTasksByProjectAction, Task } from "@/lib/actions/tasks";

export default async function Dashboard() {
    const projectResult = await getAllProjectsAction();
    const projects: Project[] = projectResult.success ? projectResult.data : [];

    let allTasks: Task[] = [];
    for (const project of projects) {
        const taskResult = await getTasksByProjectAction(project.id);
        if (taskResult.success) {
            allTasks = allTasks.concat(taskResult.data);
        }
    }

    allTasks.sort((a, b) => {
        const dateA = a.updated_at || a.created_at || "";
        const dateB = b.updated_at || b.created_at || "";
        return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return (
        <>
            <DashboardContent
                data={projectResult}
                tasks={allTasks}
                projects={projects}
            />
        </>
    )
}
