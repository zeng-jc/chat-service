import { IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  chatId: number;
  @IsNotEmpty()
  userMessage: string;
  @IsNotEmpty()
  messageId: string;
}
