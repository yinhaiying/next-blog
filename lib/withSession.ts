// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import { withIronSession } from "next-iron-session";
import { NextApiHandler } from 'next';

export function withSession(handler: NextApiHandler) {
  return withIronSession(handler, {
    // password: process.env.SECRET_COOKIE_PASSWORD,
    password: '89eb4926-debb-4d46-9293-057b956d7ff9',   // 秘钥：随机数即可
    cookieName: "blog",
    // cookieOptions: {
    //   // the next line allows to use the session in non-https environements like
    //   // Next.js dev mode (http://localhost:3000)
    //   secure: process.env.NODE_ENV === "production",
    // },
  });
}
