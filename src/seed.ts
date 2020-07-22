import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from './entity/User';
import { Post } from './entity/Post';
import { Comment } from './entity/Comment';

createConnection().then(async connection => {
  const { manager } = connection;
  // 创建user1
  const u1 = new User();
  u1.username = 'mary';
  u1.passwordDigest = '12345';
  await manager.save(u1);
  console.log(u1.id)
  // 创建post1
  const p1 = new Post();
  p1.title = "first blog";
  p1.content = "我的第一篇博客";
  p1.author = u1;
  await manager.save(p1);
  // 创建comment1
  const c1 = new Comment();
  c1.content = "第一条评论";
  c1.user = u1;
  c1.post = p1;
  await manager.save(c1);
  connection.close();
}).catch(error => console.log(error));
