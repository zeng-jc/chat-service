import { Controller, Get, Body, Param, Delete, Headers, Post, SetMetadata } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Observable, interval, map, take } from 'rxjs';
import { SSE_METADATA } from '@nestjs/common/constants';
export interface MessageEvent {
  data: number | object;
  id?: string;
  type?: string;
  retry?: number;
}
const cache = new Map();
@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @SetMetadata(SSE_METADATA, true)
  @Post('send')
  'SSE /send'(@Headers() headers, @Body() createConversationDto: CreateConversationDto): Observable<number | MessageEvent> {
    const { messageId, userMessage } = createConversationDto;
    cache.set(messageId, {
      userMessage,
      aiMessage: '',
    });
    // const { id: userId }: { id: number } = JSON.parse(headers.authorization);
    // return this.conversationService.sendMessage(userId, createConversationDto);
    const count = Math.floor(Math.random() * 60);
    const source = interval(100).pipe(
      map((e) => ({
        data: e + Math.random(),
      })),
      take(count),
    );
    const subs = source.subscribe((value) => {
      // console.log(value);
      if (!cache.get(messageId)) return subs.unsubscribe();
      cache.get(messageId).aiMessage += value.data;
      if (value.data >= count) {
        subs.unsubscribe();
      }
    });
    return source;
  }

  @Post('/save')
  async sendInfo(@Headers() headers, @Body() saveDto: { chatId: number; messageId: number }) {
    const { chatId, messageId } = saveDto;
    const { userMessage, aiMessage } = cache.get(messageId);
    const { id: userId }: { id: number } = JSON.parse(headers.authorization);
    const res = await this.conversationService.saveConversation(userId, chatId, userMessage, aiMessage);
    cache.delete(messageId);
    return res;
  }

  @Get('/list/:id')
  findAllConversations(@Headers() headers, @Param('id') chatId: string) {
    const { id: userId }: { id: number } = JSON.parse(headers.authorization);
    return this.conversationService.findAllConversations(userId, +chatId);
  }

  @Delete(':id')
  removeConversations(@Param('id') id: string) {
    return this.conversationService.removeConversations(+id);
  }
}
