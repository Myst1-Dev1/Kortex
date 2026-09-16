import { IsString, IsNotEmpty, MinLength, MaxLength, IsArray, ValidateNested, IsOptional, IsDateString } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class ParticipantDto {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID único do participante',
    })
    @IsString()
    @IsNotEmpty()
    id!: string;

    @ApiProperty({
        example: 'Maria Souza',
        description: 'Nome completo do participante',
    })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({
        example: 'maria@email.com',
        description: 'E-mail do participante',
    })
    @IsString()
    @IsNotEmpty()
    email!: string;

    @ApiPropertyOptional({
        example: 'https://exemplo.com/avatar.jpg',
        description: 'URL do avatar do participante',
        nullable: true,
    })
    @IsString()
    @IsOptional()
    avatarUrl!: string | null;
}

// class TaskDto {
//     @ApiProperty({
//         example: '123e4567-e89b-12d3-a456-426614174000',
//         description: 'ID único da tarefa',
//     })
//     @IsString()
//     @IsNotEmpty()
//     id!: string;

//     @ApiProperty({
//         example: 'Criar tela de login',
//         description: 'Título da tarefa',
//     })
//     @IsString()
//     @IsNotEmpty()
//     title!: string;

//     @ApiProperty({
//         example: 'Desenvolver a interface de autenticação utilizando Tailwind e NestJS',
//         description: 'Descrição detalhada da tarefa',
//     })
//     @IsString()
//     @IsNotEmpty()
//     description!: string;

//     @ApiProperty({
//         example: 'pending',
//         description: 'Status atual da tarefa',
//     })
//     @IsString()
//     @IsNotEmpty()
//     status!: string;

//     @ApiProperty({
//         example: '2026-12-31T23:59:59.000Z',
//         description: 'Prazo estimado para a tarefa (formato ISO 8601)',
//     })
//     @IsDateString({}, { message: 'O prazo de estimado deve ser uma data válida' })
//     @IsNotEmpty()
//     time_estimated!: string;

//     @ApiProperty({
//         example: '2026-12-25T15:00:00.000Z',
//         description: 'Data de conclusão real da tarefa (formato ISO 8601)',
//     })
//     @IsDateString({}, { message: 'O tempo de conclusão deve ser uma data válida' })
//     @IsNotEmpty()
//     time_concluded!: string;
// }

export class CreateProjectDto {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID do usuário criador do projeto',
    })
    @IsString()
    @IsNotEmpty({ message: 'O ID do usuário que irá criar o projeto é obrigatório!' })
    author_id!: string;

    @ApiProperty({
        example: 'Plataforma E-commerce',
        description: 'Nome do projeto',
        minLength: 2,
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
    @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
    name!: string;

    @ApiProperty({
        example: 'Desenvolvimento completo de uma plataforma moderna de e-commerce utilizando microsserviços NestJS.',
        description: 'Descrição detalhada do projeto',
        minLength: 30,
        maxLength: 1500,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(30, { message: 'A descrição deve ter no mínimo 30 caracteres' })
    @MaxLength(1500, { message: 'A descrição deve ter no máximo 1500 caracteres' })
    description!: string;

    @ApiProperty({
        example: '2026-12-31T23:59:59.000Z',
        description: 'Prazo final de conclusão do projeto (formato ISO 8601)',
    })
    @IsDateString({}, { message: 'O prazo de conclusão deve ser uma data válida' })
    @IsNotEmpty()
    deadline_for_completion!: string;

    @ApiPropertyOptional({
        type: () => [ParticipantDto],
        description: 'Lista opcional de participantes vinculados ao projeto',
    })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ParticipantDto)
    participants?: ParticipantDto[];

    @ApiPropertyOptional({
        example: 'https://exemplo.com/project-cover.jpg',
        description: 'URL da imagem de capa do projeto',
        nullable: true,
    })
    @IsString()
    @IsOptional()
    projectImage!: string | null;
}