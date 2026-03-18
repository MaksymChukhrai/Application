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

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Client emits 'join-room' with their userId after connecting.
   * This allows targeting notifications to specific organizers.
   */
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
    this.server
      .to(`user:${organizerId}`)
      .emit('participant:joined', payload);
  }

  notifyParticipantLeft(
    organizerId: string,
    payload: { eventId: string; eventTitle: string; userName: string },
  ): void {
    this.server
      .to(`user:${organizerId}`)
      .emit('participant:left', payload);
  }

  broadcastEventCreated(payload: {
    eventId: string;
    title: string;
    organizerName: string;
  }): void {
    this.server.emit('event:created', payload);
  }
}