import { getDatabaseConnection } from '../../lib/getDatabaseConnection';
import { GetServerSideProps, NextPage } from 'next';
import { Post } from '../../src/entity/Post'
import Link from 'next/link';

type Props = {
  posts: Post[];
}
const PostsList: NextPage<Props> = (props) => {
  const { posts } = props;
  return (
    <div>
      <h1>文章列表</h1>
      {posts.map(p =>
        <div key={p.id}>
          <Link href={`/posts/${p.id}`}>
            <a>
              {p.id}
            </a>
          </Link>
        </div>)}
    </div>
  );
};

export default PostsList;

// 通过SSR获取数据库相关信息
export const getServerSideProps: GetServerSideProps<any, { id: string }> = async (context) => {
  const connection = await getDatabaseConnection();
  const posts = await connection.manager.find(Post);
  console.log('posts111:', posts)
  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts))
    }
  };
};
