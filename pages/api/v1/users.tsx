import { NextApiHandler } from 'next';
import { getDatabaseConnection } from 'lib/getDataBaseConnection';
import { User } from '../../../src/entity/User';
import md5 from 'md5'
const Posts: NextApiHandler = async (req, res) => {
  const { username, password, passwordConfirmation } = req.body;
  const connection = await getDatabaseConnection();
  // 首先校验数据
  const errors = {
    username: [] as string[],
    password: [] as string[],
    passwordConfirmation: [] as string[]
  }
  if (username.trim().length === 0) {
    errors.username.push('用户名不能为空');
  } else if (!/[_a-zA-Z0-9]/g.test(username.trim())) {
    errors.username.push('用户名格式不合法');
  } else if (username.trim().length < 5 || username.trim().length > 30) {
    errors.username.push('用户名长度为5-30之间');
  } else if (connection.manager.find(User, { username })) {
    errors.username.push('用户名已存在');
  }
  // 校验password
  if (password === '') {
    errors.password.push('密码不能为空')
  } else if (password.length < 6) {
    errors.password.push('密码长度不能小于6位')
  }

  if (password !== passwordConfirmation) {
    errors.passwordConfirmation.push('密码不匹配')
  }
  const hasErrors = Object.values(errors).find(value => value.length > 0);
  res.setHeader('Content-Type', 'application/json;charset=utf-8');
  if (hasErrors) {
    res.statusCode = 422;
    res.write(JSON.stringify(errors));
  } else {
    // 连接数据库保存数据
    const user = new User();
    user.username = username.trim();
    user.passwordDigest = md5(password);
    await connection.manager.save(user);
    res.statusCode = 200;
    const result = {
      code: 0,
      data: {
        username: user.username
      },
      message: 'ok'
    }
    res.write(JSON.stringify(result));
  }

  res.end();
};
export default Posts;
