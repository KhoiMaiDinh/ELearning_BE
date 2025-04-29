import { AllConfigType } from '@/config';
import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient, RedisClientOptions } from 'redis';
import { ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  configService: ConfigService<AllConfigType>;
  constructor(
    private app: INestApplicationContext,
    configService: ConfigService<AllConfigType>,
  ) {
    super(app);
    this.configService = configService;
  }

  async connectToRedis(): Promise<void> {
    const host = this.configService.get('redis.host', { infer: true });
    const port = this.configService.get('redis.port', { infer: true });
    const password = this.configService.get('redis.password', { infer: true });
    const tls = this.configService.get('redis.tlsEnabled', {
      infer: true,
    });

    const redis_options: RedisClientOptions = {
      socket: {
        host,
        port,
        tls,
      },
      password,
    };

    const pub_client = createClient(redis_options);
    const sub_client = pub_client.duplicate();

    await Promise.all([pub_client.connect(), sub_client.connect()]);

    this.adapterConstructor = createAdapter(pub_client, sub_client);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
