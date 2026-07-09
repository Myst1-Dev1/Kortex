export class UpdateTaskDto {
  assigned_user_id?: string;

  name?: string;
  description?: string;

  status?: string;

  time_estimated?: string;
  time_concluded?: string;
}