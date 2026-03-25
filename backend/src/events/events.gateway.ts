import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:80',
      process.env.FRONTEND_URL ?? 'http://localhost:5173',
    ],
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly jwtService: JwtService) {} // ← добавить

  handleConnection(client: Socket): void {
    const token = client.handshake.auth?.token; // ← добавить
    if (!token) {
      this.logger.warn(`Client ${client.id} disconnected: no token`);
      client.disconnect();
      return;
    }
    try {
      this.jwtService.verify(token); // ← верифицируем
      this.logger.log(`Client connected: ${client.id}`);
    } catch {
      this.logger.warn(`Client ${client.id} disconnected: invalid token`);
      client.disconnect();
    }
  }

  // остальные методы без изменений
  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(`user:${userId}`);
    this.logger.log(`Client ${client.id} joined room user:${userId}`);
  }

  notifyParticipantJoined(
    organizerId: string,
    payload: { eventId: string; eventTitle: string; userName: string },
  ): void {
    this.server.to(`user:${organizerId}`).emit('participant:joined', payload);
  }

  notifyParticipantLeft(
    organizerId: string,
    payload: { eventId: string; eventTitle: string; userName: string },
  ): void {
    this.server.to(`user:${organizerId}`).emit('participant:left', payload);
  }

  broadcastEventCreated(payload: {
    eventId: string;
    title: string;
    organizerName: string;
  }): void {
    this.server.emit('event:created', payload);
  }
}
