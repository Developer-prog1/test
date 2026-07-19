import { Global, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    // PrismaService constructor returns the extended client instance,
    // so Nest lifecycle hooks on the class itself never run — connect here.
    await this.prisma.$neonConnectStartup();
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$neonDisconnectShutdown();
  }
}
