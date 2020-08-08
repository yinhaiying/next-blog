import { NextApiHandler } from 'next';
import { Post } from "src/entity/Post"
import { getDatabaseConnection } from 'lib/getDatabaseConnection';
import { withSession } from 'lib/withSession';
const Posts: NextApiHandler = async (req, res) => {
  if (req.method === 'PATCH') {
    const { title, content, id } = req.body;
    const connection = await getDatabaseConnection();
    const post = await connection.manager.findOne<Post>('Post', id);
    post.title = title;
    post.content = content;
    const user = req.session.get('currentUser');
    if (!user) {
      // 如果用户不存在表示没有登录。
      res.statusCode = 401;
      res.end();
      return;
    }
    await connection.manager.save(post);
    res.json(post);
  } else if (req.method === 'DELETE') {
    const id = req.query.id.toString();
    const connection = await getDatabaseConnection();
    const deleteResult = await connection.manager.delete('Post', id);
    res.statusCode = deleteResult.affected >= 0 ? 200 : 400;
    res.end();
  }
};
export default withSession(Posts);
