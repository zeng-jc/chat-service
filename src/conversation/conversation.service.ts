import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { DatabaseService } from 'src/database/database.service';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { ZhipuAI } from 'zhipuai-sdk-nodejs-v4';
import { StringDecoder } from 'string_decoder';
import { configLoader } from '../configLoader';

const zhipuai_apikey: string = configLoader('zhipuai_apikey');

@Injectable()
export class ConversationService {
  constructor(
    private readonly database: DatabaseService,
    private httpService: HttpService,
  ) {}

  isInvalidJSON(json: string) {
    try {
      return JSON.parse(json);
    } catch (error) {
      return false;
    }
  }

  sendAIMessage(userId: number, createConversationDto: CreateConversationDto): Observable<unknown> {
    return new Observable((subscribe) => {
      const { userMessage } = createConversationDto;
      const dialogue = async () => {
        const ai = new ZhipuAI({
          apiKey: zhipuai_apikey,
          cacheToken: true,
        });
        const result: any = await ai.createCompletions({
          model: 'glm-3-turbo',
          messages: [{ role: 'user', content: userMessage }],
          stream: true,
        });
        const decoder = new StringDecoder('utf8');
        for await (const chunk of result) {
          decoder
            .write(chunk)
            .split('\n\n')
            .forEach((item) => {
              if (!item) return;
              const json = this.isInvalidJSON(item.slice(6));
              if (json) {
                subscribe.next({ content: json.choices[0].delta?.content ?? '' });
              } else {
                // sse传输字符串截断位置是随机的，如果是在数据中间位置截断就会导致失败
                // console.log('json-final', item);
              }
              if (item.includes('[DONE]')) {
                subscribe.next('[DONE]');
                decoder.end('');
                subscribe.complete();
              }
            });
        }
      };
      dialogue();
    });
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
