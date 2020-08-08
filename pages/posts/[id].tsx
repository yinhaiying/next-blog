import React, { useCallback } from 'react';
import { getDatabaseConnection } from '../../lib/getDatabaseConnection';
import { GetServerSideProps, NextPage } from 'next';
import { Post } from '../../src/entity/Post';
import axios from 'axios'
import Link from 'next/link'
import marked from 'marked';
type Props = {
  post: Post;
  id: number;
}
const postsShow: NextPage<Props> = (props) => {
  const { post, id } = props;
  const onDelete = useCallback(() => {
    axios.delete(`/api/v1/posts/${id}`).then(() => {
      window.alert('删除成功');
      window.location.href = '/posts/list';
    }).catch(((error) => {
      console.log(error);
      alert('删除失败')
    }))
  }, [id])
  return (
    <>
      <div className="wrapper">
        <header>
          <h1>{post.title}</h1>
          <div>
            <Link href="/posts/[id]/edit" as={`/posts/${post.id}/edit`}>
              <a>编辑文章</a>
            </Link>
            <span className="delete" onClick={onDelete}>删除文章</span>
          </div>

        </header>
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
           .wrapper > header{
            display:flex;
            align-items:center;
          }
          .wrapper > header > h1{
            margin-right:auto;
            border-bottom:1px solid #ddd;
            padding-bottom:16px;
            margin-bottom:16px;
          }
          .delete{
            color:red;
            margin-left:20px;
            cursor:pointer;
            border-bottom:1px solid red;
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
  const id = context.params.id;
  const post = await connection.manager.findOne(Post, id)
  return {
    props: {
      post: JSON.parse(JSON.stringify(post)),
      id: parseInt(id.toString())
    }
  };
};
