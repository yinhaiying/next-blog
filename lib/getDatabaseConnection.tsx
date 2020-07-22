
import { createConnection, getConnection, getConnectionManager } from 'typeorm';

// 创建一个connection
const connection = (async function () {
  console.log('创建connection')
  const manager = getConnectionManager();
  const hasDefaultConnection = manager.has('default');
  if (!hasDefaultConnection) {
    return await createConnection();
  } else {
    const current = manager.get('default');
    // 判断复用的connection是否被关闭
    if (current.isConnected) {
      return current;
    } else {
      return await createConnection();
    }
  }
})()

export const getDatabaseConnection = async () => {
  console.log('获取connection1');
  // 始终返回的是同一个connection
  return connection;
}
