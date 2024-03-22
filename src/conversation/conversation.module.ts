import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { verifyTokenMiddleware } from 'src/common/middleware';

@Module({
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(verifyTokenMiddleware).forRoutes('conversation');
  }
}
