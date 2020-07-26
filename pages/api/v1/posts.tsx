import { NextApiHandler } from 'next';
import { Post } from "../../../src/entity/Post"
import { getDatabaseConnection } from 'lib/getDatabaseConnection';

const Posts: NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    const { title, content } = req.body;
    console.log('title:', title)
    const post = new Post();
    post.title = title;
    post.content = content;
    const connection = await getDatabaseConnection();
    await connection.manager.save(post);
    res.json(post);
  }
};
export default Posts;
