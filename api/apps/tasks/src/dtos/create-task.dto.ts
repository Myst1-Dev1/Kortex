export class CreateTaskDto {
  project_id: string;
  task_author_id: string;
  assigned_user_id?: string;
  name: string;
  description: string;

  time_estimated?: string;
}