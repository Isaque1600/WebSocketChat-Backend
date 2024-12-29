import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'messages',
})
export class MessagesGateway {
  @SubscribeMessage('conversations')
  handleMessage(@MessageBody('message') payload: string): string {
    return 'hello client';
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
}
