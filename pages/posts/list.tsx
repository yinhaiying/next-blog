import { getDatabaseConnection } from '../../lib/getDatabaseConnection';
import { GetServerSideProps, NextPage } from 'next';
import { Post } from '../../src/entity/Post'
import Link from 'next/link';
import { getParam } from 'lib/utils';
import { usePager } from 'hooks/usePager'
type Props = {
  posts: Post[];
  count: number;
  size: number;
  page: number;
  totalPage: number
}
const PostsList: NextPage<Props> = (props) => {
  const { posts, count, size, page, totalPage } = props;
  const { pager } = usePager({ page, totalPage });
  return (
    <>
      <div className="posts">
        <header>
          <h1>文章列表</h1>
          <Link href="/posts/new">
            <a>新增文章</a>
          </Link>
          <Link href="/">
            <a>回到首页</a>
          </Link>
        </header>
        {posts.map(p =>
          <div key={p.id} className="postItem">
            <Link href={`/posts/${p.id}`}>
              <a>
                {p.title}
              </a>
            </Link>
          </div>)}
        <footer>
          {pager}
        </footer>
      </div>
      <style jsx>
        {
          `
          .posts{
            max-width:800px;
            margin:0 auto;
            padding:16px;
          }
          .posts > header{
            display:flex;
            align-items:center;
          }
          .posts > header > h1{
            margin-right:auto;
          }
          .postItem{
            border-bottom:1px solid #ddd;
            padding:8px 0;
          }
          .postItem > a{
            border-bottom:none;
            color:#000;
          }
          .postItem > a:hover{
            color:#00adb5;
          }

        `
        }
      </style>
    </>

  );
};

export default PostsList;

// 通过SSR获取数据库相关信息
export const getServerSideProps: GetServerSideProps<any, { id: string }> = async (context) => {
  const connection = await getDatabaseConnection();
  let page = parseInt(getParam(context.req.url, 'page')) <= 0 ? 1 : parseInt(getParam(context.req.url, 'page'));
  const size = parseInt(getParam(context.req.url, 'size')) || 10;
  const [posts, count] = await connection.manager.findAndCount(Post, { skip: size * (page - 1), take: size });
  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      count: count,
      size: size,
      page: page,
      totalPage: Math.ceil(count / size)
    }
  };
};
