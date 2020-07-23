import { NextApiHandler } from 'next';

const Posts: NextApiHandler = async (req, res) => {
  const { username, password, passwordConfirmation } = req.body;
  console.log('body:', req.body)
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(''));
  res.end();
};
export default Posts;
