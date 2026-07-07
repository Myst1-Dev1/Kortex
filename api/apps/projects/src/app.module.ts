import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from "./projects.module";

@Module({
    imports: [
        ProjectsModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URI,
            autoLoadEntities: true,
            synchronize: true,
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
