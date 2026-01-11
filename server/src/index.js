import { initMongoDB } from './db/initMongoDB.js';
import { startServer } from './server.js';

const bootstrap = async () => {
  await initMongoDB();
  startServer();
}; // спочатку підключається база даних, а потім сервер

bootstrap();
