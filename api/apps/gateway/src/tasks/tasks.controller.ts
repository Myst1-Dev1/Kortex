import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/createTaskDto';
import { firstValueFrom } from 'rxjs';
import { UpdateTaskDto } from './dto/updateTaskDto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(
    @Inject('TASKS_CLIENT') private readonly tasksClient: ClientProxy,
  ) {}

  @Post('create-new-task')
  @ApiOperation({ summary: 'Criar uma nova tarefa em um projeto' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async createNewTask(@Req() req, @Body() taskData: CreateTaskDto) {
    return firstValueFrom(
      this.tasksClient.send('tasks.create', {
        ...taskData,
        task_author_id: req.user.userId,
      }),
    );
  }

  @Get('findAll/:id')
  @ApiOperation({ summary: 'Listar todas as tarefas vinculadas a um projeto' })
  @ApiParam({ name: 'id', description: 'UUID do projeto', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Lista de tarefas retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async findAll(@Param('id') projectId: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.findByProject', projectId),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma tarefa específica pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID da tarefa', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Tarefa encontrada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada.' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.findOne', id),
    );
  }

  @Patch('/update/:id')
  @ApiOperation({ summary: 'Atualizar os dados de uma tarefa' })
  @ApiParam({ name: 'id', description: 'UUID da tarefa a ser atualizada', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return firstValueFrom(
      this.tasksClient.send('tasks.update', {
        id,
        userId: req.user.userId,
        dto,
      }),
    );
  }

  @Patch('/updateStatus/:id')
  @ApiOperation({ summary: 'Atualizar apenas o status (e opcionalmente a data de conclusão) de uma tarefa' })
  @ApiParam({ name: 'id', description: 'UUID da tarefa', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', example: 'done', description: 'Novo status da tarefa' },
        time_concluded: { type: 'string', example: '2026-12-31T23:59:59.000Z', description: 'Data/hora opcional de conclusão' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Status da tarefa atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async updateStatus(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: { status: string; time_concluded?: string },
  ) {
    return firstValueFrom(
      this.tasksClient.send('tasks.updateStatus', {
        id,
        userId: req.user.userId,
        status: dto.status,
        time_concluded: dto.time_concluded,
      }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar uma tarefa pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID da tarefa a ser deletada', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Tarefa deletada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada.' })
  async remove(@Req() req, @Param('id') id: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.delete', {
        id,
        userId: req.user.userId,
      }),
    );
  }
}