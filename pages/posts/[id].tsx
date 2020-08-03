import React from 'react';
import { getDatabaseConnection } from '../../lib/getDatabaseConnection';
import { GetServerSideProps, NextPage } from 'next';
import { Post } from '../../src/entity/Post';
import marked from 'marked';
type Props = {
  post: Post
}
const postsShow: NextPage<Props> = (props) => {
  const { post } = props;
  return (
    <>
      <div className="wrapper">
        <h2>{post.title}</h2>
        <article className="markdown-body" dangerouslySetInnerHTML={{ __html: marked(post.content) }}>
        </article>
      </div>
      <style jsx>
        {
          `
           .wrapper{
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
           }
           h2{
             border-bottom:1px solid #ddd;
             padding-bottom:16px;
             margin-bottom:16px;
           }
          `
        }
      </style>
    </>

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
