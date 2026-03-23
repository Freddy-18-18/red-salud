import type { ApiClient } from '../client';

export class MessagingApi {
  constructor(private client: ApiClient) {}

  getConversations(params?: Record<string, string>) {
    return this.client.get('/messaging/conversations', params);
  }

  getMessages(conversationId: string, params?: Record<string, string>) {
    return this.client.get(`/messaging/conversations/${conversationId}/messages`, params);
  }

  sendMessage(conversationId: string, data: unknown) {
    return this.client.post(`/messaging/conversations/${conversationId}/messages`, data);
  }
}
