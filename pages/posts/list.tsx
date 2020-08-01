import { getDatabaseConnection } from '../../lib/getDatabaseConnection';
import { GetServerSideProps, NextPage } from 'next';
import { Post } from '../../src/entity/Post'
import Link from 'next/link';
import { getParam } from 'lib/utils'
type Props = {
  posts: Post[];
  count: number;
  size: number;
  page: number;
}
const PostsList: NextPage<Props> = (props) => {
  const { posts, count, size, page } = props;
  return (
    <div>
      <h1>文章列表:{count}</h1>
      {posts.map(p =>
        <div key={p.id}>
          <Link href={`/posts/${p.id}`}>
            <a>
              {p.id}
            </a>
          </Link>
        </div>)}
      <footer>
        共{count}篇文章，当前是第{page}页
        <Link href={`/posts/list/?page=${page - 1}`}>
          <a >上一页</a>
        </Link>
        |
        <Link href={`/posts/list/?page=${page + 1}`}>
          <a >下一页</a>
        </Link>

      </footer>
    </div>
  );
};

export default PostsList;

// 通过SSR获取数据库相关信息
export const getServerSideProps: GetServerSideProps<any, { id: string }> = async (context) => {
  const connection = await getDatabaseConnection();

  const page = Number(getParam(context.req.url, 'page')) || 1;
  const size = Number(getParam(context.req.url, 'size')) || 10;
  const [posts, count] = await connection.manager.findAndCount(Post, { skip: size * (page - 1), take: size });
  console.log('posts:', posts);
  console.log('count:', count);
  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      count: count,
      size: size,
      page: page
    }
  };
};
