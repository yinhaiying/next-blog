import "reflect-metadata";
import { createConnection } from "typeorm";
import { Post } from './entity/Post'

createConnection().then(async connection => {
  const posts = await connection.manager.find(Post);
  console.log('posts:', posts)
  if (posts.length === 0) {
    // seed脚本创建数据
    await connection.manager.save([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
      return new Post({ title: `Post${n}`, content: `我的第 ${n}篇文章` })
    }));
  }
  connection.close();
}).catch(error => console.log(error));
