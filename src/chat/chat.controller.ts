import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/create')
  createChat(@Headers() headers) {
    const { id: userId }: { id: number } = JSON.parse(headers.authorization);
    return this.chatService.createChat(userId);
  }

  @Get('list')
  findAllChats(@Headers() headers, @Query() query?: { keywords: string }) {
    const { id: userId }: { id: number } = JSON.parse(headers.authorization);
    return this.chatService.findAllChats(userId, query);
  }

  @Get(':id')
  findOneChat(@Param('id') id: string) {
    return this.chatService.findOneChat(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(+id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(+id);
  }
}
