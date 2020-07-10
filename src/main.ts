import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

const httpsOptions = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert'),
};

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { httpsOptions });

    app.use(cookieParser());
    app.use(helmet());

    // ToDo: move origin to config file
    app.enableCors({
        origin: 'http://okea.test:4200',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
    });

    await app.listen(3333);
}

bootstrap();
