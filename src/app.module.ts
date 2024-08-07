import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { APP_PIPE } from '@nestjs/core';
import { SecretKeyModule } from './secretKey/secretKey.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { ConversationModule } from './conversation/conversation.module';
import { UploadModule } from './upload/upload.module';
import { MinioClientModule } from './minio/minio.module';

@Module({
  imports: [DatabaseModule, SecretKeyModule, AuthModule, ChatModule, ConversationModule, UploadModule, MinioClientModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
