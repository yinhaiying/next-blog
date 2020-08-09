import { NextPage } from 'next'
import Link from 'next/link';
const Index: NextPage = () => {
  return (
    <>
      <div className="cover">
        <div className="logo">
          <img src="/bg.jpg" alt="logo" />
          <div className="title">
            <h1>海鹰的个人博客</h1>
            <h2>总有一天你会感激今天努力的自己!!</h2>
          </div>

        </div>
        <div className="content">
          <p><Link href="/posts/list"><a >文章列表</a></Link></p>
        </div>

      </div>


      <style jsx>
        {
          `
            .cover{
              display:flex;
              justify-conten:center;
              align-items:center;
              flex-direction:column;
              hieght:100vh;
            }
            .cover .logo{
              position:relative;
            }
            .logo img{
              width:100%;
            }
            .logo .title{
              position:absolute;
              left:50%;
              top:50%;
              transform:translate(-50%,-50%);
              text-align:center;
              width:100%;
            }
          `
        }
      </style>
    </>
  )
}

export default Index;
