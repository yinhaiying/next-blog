
import "reflect-metadata";
import { Post } from "../src/entity/Post";
import { User } from "../src/entity/User";
import { Comment } from "../src/entity/Comment";
import { createConnection, getConnection, getConnectionManager } from 'typeorm';
import config from 'ormconfig.json'
const create = () => {
  // @ts-ignore
  return createConnection({
    ...config,
    host: process.env.NODE_ENV === 'production' ? 'localhost' : config.host,
    'entities': [Post, User, Comment]
  })
}


// 创建一个connection
const connection = (async function () {

  const manager = getConnectionManager();
  const current = manager.has('default') && manager.get('default');
  if (current && current.isConnected) {
    await current.close();
  }
  return await create();
})()

export const getDatabaseConnection = async () => {
  // 始终返回的是同一个connection
  return connection;
}
