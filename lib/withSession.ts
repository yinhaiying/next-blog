// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import { withIronSession } from "next-iron-session";
import { NextApiHandler, GetServerSideProps } from 'next';
export function withSession(handler: NextApiHandler | GetServerSideProps) {
  return withIronSession(handler, {
    // password: process.env.SECRET_COOKIE_PASSWORD,
    password: process.env.SECRET,   // 秘钥：随机数即可
    cookieName: "blog",
    cookieOptions: {
      // the next line allows to use the session in non-https environements like
      // Next.js dev mode (http://localhost:3000)
      // secure: process.env.NODE_ENV === "production",
      secure: false,
    },
  });
}
