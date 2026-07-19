import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

type HealthLiveBody = {
  status: string;
  timestamp: string;
};

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $neonConnectStartup: () => Promise.resolve(),
        $neonDisconnectShutdown: () => Promise.resolve(),
        $queryRaw: () => Promise.resolve([{ '?column?': 1 }]),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/v1/health (GET)', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/api/v1/health')
      .expect(200);

    const body = response.body as HealthLiveBody;
    expect(body.status).toBe('ok');
  });
});
