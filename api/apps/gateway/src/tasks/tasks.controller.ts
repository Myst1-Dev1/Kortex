import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateTaskDto } from "./dto/createTaskDto";
import { firstValueFrom } from "rxjs";
import { UpdateTaskDto } from "./dto/updateTaskDto";

@Controller('tasks')
export class TasksController {
    constructor(
        @Inject('TASKS_CLIENT') private readonly tasksClient: ClientProxy,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('create-new-task')
    async createNewTask(
            @Req() req,
            @Body() taskData: CreateTaskDto,
            ) {
                console.log('o que vem aqui', req);
            return firstValueFrom(
                this.tasksClient.send('tasks.create', {
                ...taskData,
                task_author_id: req.user.userId,
            }),
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('findAll/:id')
    async findAll(@Param('id') projectId: string) {
        return firstValueFrom(
        this.tasksClient.send('tasks.findByProject', projectId),
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(
        @Param('id') id: string,
    ) {
        return firstValueFrom(
        this.tasksClient.send('tasks.findOne', id),
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/update/:id')
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
    @UseGuards(JwtAuthGuard)
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

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(
        @Req() req,
        @Param('id') id: string,
    ) {
        return firstValueFrom(
        this.tasksClient.send('tasks.delete', {
            id,
            userId: req.user.userId,
        }),
        );
    }
}
