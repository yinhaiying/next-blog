import { NextApiHandler } from 'next';
import { getDatabaseConnection } from 'lib/getDataBaseConnection';
import { User } from '../../../src/entity/User';
const Posts: NextApiHandler = async (req, res) => {
  const { username, password, passwordConfirmation } = req.body;

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
  } else if (username.trim().length < 6 || username.trim().length > 30) {
    errors.username.push('用户名长度为6-30之间');
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
  if (hasErrors) {
    res.statusCode = 422;
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(errors));
    res.end();
  } else {

  }

};
export default Posts;
