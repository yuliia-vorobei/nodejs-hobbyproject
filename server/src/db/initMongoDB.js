import mongoose from 'mongoose'; // для роботи з node.js - валідування та зручний інтерфейс
import { getEnvVar } from '../utils/getEnvVar.js';

export const initMongoDB = async () => {
  try {
    const user = getEnvVar('MONGODB_USER');
    const pwd = getEnvVar('MONGODB_PASSWORD');
    const url = getEnvVar('MONGODB_URL');
    const db = getEnvVar('MONGODB_DB');

    await mongoose.connect(`mongodb+srv://${user}:${pwd}@${url}/${db}?`);
    console.log('Mongo connection successfully established!');
  } catch (e) {
    console.log('Error while setting up mongo connection', e);
    throw e;
  }
};
