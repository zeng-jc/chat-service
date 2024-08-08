export const localConfig = {
  service: {
    host: '127.0.0.1',
    port: 3000,
  },
  mysql: {
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: '123',
    database: 'chat',
    retryDelay: 500,
    retryAttempts: 5,
    synchronize: true,
    autoLoadEntities: true,
  },
  redis: {
    socket: {
      host: '127.0.0.1',
      port: 6379,
    },
  },
  zhipuai_apikey: '',
  minio: {
    endPoint: '127.0.0.1',
    port: 9090,
    useSSL: false,
    accessKey: '2356924146',
    secretKey: '123456',
  },
};
