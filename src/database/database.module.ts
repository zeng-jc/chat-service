import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity, ChatsEntity, ConversationsEntity, UploadsEntity } from './entities';
import { dbConfig } from './db.config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => dbConfig,
    }),
    TypeOrmModule.forFeature([UsersEntity, ChatsEntity, ConversationsEntity, UploadsEntity]),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
