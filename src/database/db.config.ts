import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { configLoader } from '../configLoader';

export const dbConfig: TypeOrmModuleOptions = configLoader('mysql');
