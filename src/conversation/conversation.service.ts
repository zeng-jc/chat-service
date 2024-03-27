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

  sendAIMessage(userId: number, createConversationDto: CreateConversationDto): Observable<unknown> {
    let observable = new Observable((subscribe) => {
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
        const chunks = [];
        for await (const chunk of result) {
          decoder
            .write(chunk)
            .split('\n\n')
            .forEach((item) => {
              const matches = item.match(/"content":"[^"]*"/);
              const res = matches !== null && `{"data":{${matches[0]}}}`;
              if (res) {
                chunks.push(res);
                subscribe.next(res);
              }
              if (item === 'data: [DONE]') {
                const NODE = item.split(' ')[1];
                chunks.push(NODE);
                subscribe.next(NODE);
                decoder.end();
                subscribe.complete();
                observable = null;
              }
            });
        }
      };
      dialogue();
    });
    return observable;
  }

  // 自定义请求方式
  sendAIMessageCustomRequest(userId: number, createConversationDto: CreateConversationDto): any {
    const { userMessage } = createConversationDto;
    const requestBody = {
      model: 'glm-4',
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
      stream: true,
    };
    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: '',
    };
    const sseUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'; // 替换为你的 SSE 服务端点
    this.httpService.axiosRef
      .post(sseUrl, requestBody, {
        headers: headersRequest,
        responseType: 'stream',
      })
      .then((response) => {
        response.data.on('data', () => {});
        response.data.on('end', () => {});
        response.data.on('error', () => {});
        response.data.on('close', () => {});
      })
      .catch(() => {});
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
