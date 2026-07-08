import { IsString, IsNotEmpty, MinLength, MaxLength, IsArray, ValidateNested, IsOptional, IsDateString } from "class-validator";
import { Type } from "class-transformer";

class ParticipantDto {
    @IsString()
    @IsNotEmpty()
    id!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsOptional()
    avatarUrl!: string | null;
}

class TaskDto {
    @IsString()
    @IsNotEmpty()
    id!: string;

    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsString()
    @IsNotEmpty()
    status!: string;

    @IsDateString({}, { message: 'O prazo de estimado deve ser uma data válida' })
    @IsNotEmpty()
    time_estimated!: string;

    @IsDateString({}, { message: 'O tempo de conclusão deve ser uma data válida' })
    @IsNotEmpty()
    time_concluded!: string;
}

export class CreateProjectDto {
    @IsString()
    @IsNotEmpty({ message: 'O ID do usuário que irá criar o projeto é obrigatório!' })
    author_id!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
    @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
    name!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(30, { message: 'A descrição deve ter no mínimo 30 caracteres' })
    @MaxLength(1500, { message: 'A descrição deve ter no máximo 1500 caracteres' })
    description!: string;

    @IsDateString({}, { message: 'O prazo de conclusão deve ser uma data válida' })
    @IsNotEmpty()
    deadline_for_completion!: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ParticipantDto)
    participants?: ParticipantDto[];

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => TaskDto)
    tasks?: TaskDto[];

    @IsString()
    @IsOptional()
    projectImage!: string | null;
}