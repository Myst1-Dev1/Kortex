import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './createProjectDto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
