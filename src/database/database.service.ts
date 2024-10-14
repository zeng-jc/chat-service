import { UsersEntity, ChatsEntity, ConversationsEntity, UploadsEntity } from './entities';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(UsersEntity)
    public readonly usersRepo: Repository<UsersEntity>,

    @InjectRepository(ChatsEntity)
    public readonly chatsRepo: Repository<ChatsEntity>,

    @InjectRepository(ConversationsEntity)
    public readonly conversationsRepo: Repository<ConversationsEntity>,

    @InjectEntityManager()
    public readonly entityManager: EntityManager,

    @InjectRepository(UploadsEntity)
    public readonly uploadsRepo: Repository<UploadsEntity>,
  ) {}
}
