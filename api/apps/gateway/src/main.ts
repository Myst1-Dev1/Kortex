import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';

import * as bodyParser from 'body-parser';

async function bootstrap() {
  process.title = 'Gateway';

  const logger = new Logger('GatewayBootstrap');

  const app = await NestFactory.create(GatewayModule);

  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: true, // aceita qualquer origem (bom p/ dev)
    credentials: true, // permite cookies / auth headers
  });

  app.enableShutdownHooks();

  const port = Number(process.env.GATEWAY_PORT ?? 4002);

  await app.listen(port);

  logger.log(`Gateway is running on http://localhost:${port}`);
}
bootstrap();
