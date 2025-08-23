import { TokenService } from '@/api/token';
import { Nanoid } from '@/common';
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly tokenService: TokenService) {}

  @WebSocketServer()
  server: Server;

  async emitToUser(user_id: Nanoid, payload: any) {
    this.logger.debug('Emitting to user', user_id);
    this.server.to(user_id).emit('notification', payload);
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.headers?.token; // 🔥 Read token
      if (!token) throw new Error('No token provided');

      const payload = await this.tokenService.verifyAccessToken(token); // 🔥 Verify token

      client.data.user = payload; // 🔥 Attach user payload to socket
      this.logger.log(`Authenticated user: ${payload.id}`);
    } catch (error) {
      this.logger.error('Socket authentication error:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data?.user;

    if (user) {
      this.logger.debug(
        `User ${user.id} disconnected [Socket ID: ${client.id}]`,
      );
      client.leave(user.id);
    } else {
      this.logger.debug(`Client disconnected: ${client.id} (unauthenticated)`);
    }
  }

  @SubscribeMessage('register')
  register(
    @MessageBody() { user_id }: { user_id: Nanoid },
    @ConnectedSocket() client: Socket,
  ) {
    if (client.data?.user?.id !== user_id) {
      this.logger.error('User trying to register wrong user ID!');
      client.disconnect();
      return;
    }

    client.join(user_id);
    this.logger.log(`Client ${client.id} joined room ${user_id}`);
  }
}
