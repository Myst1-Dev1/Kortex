import { PartialType } from "@nestjs/mapped-types";
import { CreateTaskDto } from "./createTaskDto";

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}