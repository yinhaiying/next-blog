import { NextApiHandler } from 'next';
import { Post } from "../../../src/entity/Post"
import { getDatabaseConnection } from 'lib/getDatabaseConnection';
import { withSession } from 'lib/withSession';
const Posts: NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    const { title, content } = req.body;
    console.log('title:', title)
    const post = new Post();
    post.title = title;
    post.content = content;
    const user = req.session.get('currentUser');
    post.author = user;   // 通过关联，可以直接使用author，而不需要设置authorId
    const connection = await getDatabaseConnection();
    await connection.manager.save(post);
    res.json(post);
  }
};
export default withSession(Posts);
