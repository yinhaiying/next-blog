import "reflect-metadata";
import { createConnection } from "typeorm";
import { Post } from './entity/Post'

createConnection().then(async connection => {


  const posts = await connection.manager.find(Post);
  console.log(posts);
  const p = new Post();
  p.title = "第一篇博客";
  p.content = "我的第一篇博客";
  await connection.manager.save(p);
  const post2 = await connection.manager.find(Post);
  console.log(post2)
  connection.close();
}).catch(error => console.log(error));
