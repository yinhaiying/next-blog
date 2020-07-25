import { GetServerSideProps, NextPage } from 'next';
import { UAParser } from 'ua-parser-js';
import { useEffect, useState } from 'react';
import { getDatabaseConnection } from 'lib/getDatabaseConnection';
import { Post } from '../src/entity/Post';
import Link from 'next/link'
type Props = {
  posts: Post[],
}
const index: NextPage<Props> = (props) => {

  const { posts } = props;
  console.log(posts)
  return (
    <div>
      {
        posts.map((post) => {
          return (
            <Link key={post.id} href={`/posts/${post.id}`}>
              <a >{post.title}</a>
            </Link>
          )
        })
      }
    </div>
  );
};
export default index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const connection = await getDatabaseConnection();
  const posts = await connection.manager.find(Post);
  console.log('posts:', posts)
  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts))
    }
  };
};
