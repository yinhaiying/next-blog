/// <reference types="next" />
/// <reference types="next/types/global" />

// 如果在声明文件中有import引入，那么这个模块就变成局部模块，而不是全局模块了。
// 因此我们把需要定义成全局的模块抽离出来
import * as Next from 'next';
import { NextApiRequest } from 'next';
import { Session } from 'next-iron-session';
declare module "*.png" {
  const value: string;
  export default value;
}



declare module 'next' {

  interface NextApiRequest {
    session: Session
  }
}
