import { NextApiHandler } from 'next';
import { getDatabaseConnection } from 'lib/getDatabaseConnection';
import { withSession } from 'lib/withSession';
import { User } from 'src/entity/User';
import md5 from 'md5'
import { SignIn } from './../../../src/model/SignIn';
const Session: NextApiHandler = async (req, res) => {
  const { username, password } = req.body;

  const connection = await getDatabaseConnection();
  res.setHeader('Content-Type', 'application/json;charset=utf-8');
  const signIn = new SignIn();
  signIn.username = username;
  signIn.password = password;
  await signIn.validate();
  if (signIn.hasErrors()) {
    res.statusCode = 422;
    res.end(JSON.stringify(signIn.errors))
  } else {
    res.statusCode = 200;
    req.session.set('currentUser', signIn.user);
    await req.session.save();
    res.end(JSON.stringify(signIn.user));
  }
}
export default withSession(Session);
