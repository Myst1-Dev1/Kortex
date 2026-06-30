import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const createWinstonLogger = (serviceName: string) => {
  return WinstonModule.createLogger({
    transports: [
      // Console bonito para desenvolvimento
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context }) => {
            return `[Nest] - ${timestamp}  ${level} [${context || 'Application'}] ${message}`;
          }),
        ),
      }),
      // Arquivo de erro dinâmico com o nome do microsserviço
      new winston.transports.File({ 
        filename: `logs/${serviceName}-error.log`, 
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      }),
    ],
  });
};