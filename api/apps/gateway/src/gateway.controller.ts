import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class GatewayController {
  constructor(
    @Inject('AUTH_CLIENT') private readonly authClient: ClientProxy,
    @Inject('MEDIA_CLIENT') private readonly mediaClient: ClientProxy,
    @Inject('PROJECTS_CLIENT') private readonly projectsClient: ClientProxy,
    @Inject('TASKS_CLIENT') private readonly tasksClient: ClientProxy,
  ) {}

  @Get('/health')
  async health() {
    const ping = async (serviceName: string, client: ClientProxy) => {
      try {
        const result = await firstValueFrom(
          client.send('service.ping', { from: 'gateway' }),
        );

        return {
          ok: true,
          service: serviceName,
          result,
        };
      } catch (err: any) {
        return {
          ok: false,
          service: serviceName,
          error: err?.message ?? 'service unavailable',
        };
      }
    };

    const [auth, media, projects, tasks] = await Promise.all([
      ping('auth', this.authClient),
      ping('media', this.mediaClient),
      ping('projects', this.projectsClient),
      ping('tasks', this.tasksClient),
    ]);

    const ok = [auth, media, projects, tasks].every((s) => s.ok);

    return {
      ok,
      gateway: {
        service: 'gateway',
        now: new Date().toISOString(),
      },
      services: {
        auth,
        media,
        projects,
        tasks,
      },
    };
  }
}
