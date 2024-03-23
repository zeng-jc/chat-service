import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ConversationService {
  constructor(private readonly database: DatabaseService) {}
  async sendMessage(userId: number, createConversationDto: CreateConversationDto) {
    const { chatId, userMessage } = createConversationDto;
    return { chatId, userMessage };
  }

  async saveConversation(userId: number, chatId: number, userMessage: string, aiMessage: string) {
    return await this.database.conversationsRepo.save({
      userId,
      chatId,
      userMessage,
      aiMessage,
    });
  }

  async findAllConversations(userId: number, chatId: number) {
    if (!Number.isInteger(chatId)) return [];
    const res = await this.database.conversationsRepo.find({
      where: {
        userId,
        chatId,
      },
    });
    return {
      list: res,
    };
  }

  async removeConversations(id: number) {
    return await this.database.conversationsRepo.delete(id);
  }
}
