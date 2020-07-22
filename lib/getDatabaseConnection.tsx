
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
    'entities': [Post, User, Comment]
  })
}


// 创建一个connection
const connection = (async function () {
  console.log('创建connection')
  const manager = getConnectionManager();
  const hasDefaultConnection = manager.has('default');
  if (!hasDefaultConnection) {
    return await create();
  } else {
    const current = manager.get('default');
    // 判断复用的connection是否被关闭
    if (current.isConnected) {
      return current;
    } else {
      return await create();
    }
  }
})()

export const getDatabaseConnection = async () => {
  console.log('获取connection1');
  // 始终返回的是同一个connection
  return connection;
}
