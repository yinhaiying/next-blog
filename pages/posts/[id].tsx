import React from 'react';
import { getPost, getPostIds } from '../../lib/posts';
import { getDatabaseConnection } from '../../lib/getDatabaseConnection';
import { GetServerSideProps, NextPage } from 'next';
import { Post } from '../../src/entity/Post'
type Props = {
  post: Post
}
const postsShow: NextPage<Props> = (props) => {
  const { post } = props;
  return (
    <div>
      <h1>{post.title}</h1>
      <article dangerouslySetInnerHTML={{ __html: post.content }}>
      </article>
    </div>
  );
};

export default postsShow;

export const getServerSideProps: GetServerSideProps<any, { id: string }> = async (context) => {
  const connection = await getDatabaseConnection();
  console.log('params', context.params)
  const post = await connection.manager.findOne(Post, context.params.id)
  return {
    props: {
      post: JSON.parse(JSON.stringify(post))
    }
  };
};
