import { Injectable } from '@nestjs/common';
import { UpdateChatDto } from './dto/update-chat.dto';
import { DatabaseService } from 'src/database/database.service';
import { Like } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(private readonly database: DatabaseService) {}
  async createChat(userId: number) {
    await this.database.chatsRepo.insert({
      userId,
      name: '新聊天',
    });
    return {};
  }

  async findAllChats(userId: number, query?: { keywords: string }) {
    const res = await this.database.chatsRepo.find({
      where: { userId, name: Like(`%${query.keywords ?? ''}%`) },
      order: {
        id: 'DESC',
      },
    });
    return {
      list: res,
    };
  }

  async findOneChat(id: number) {
    return id;
  }

  async update(id: number, updateChatDto: UpdateChatDto) {
    const { name } = updateChatDto;
    await this.database.chatsRepo.update(id, { name });
    return {};
  }

  async remove(id: number) {
    await this.database.chatsRepo.delete(id);
    return {};
  }
}
