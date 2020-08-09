
import { useState, useCallback } from 'react'
import axios, { AxiosResponse } from 'axios'
import { AxiosError } from 'axios'
import { GetServerSideProps, NextPage, GetServerSidePropsContext } from 'next';
import { withSession } from 'lib/withSession';
import { User } from 'src/entity/User';
import qs from 'query-string';
import { getParam } from 'lib/utils'
const SignUp: NextPage<{ user: User }> = (props) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState({
    username: [],
    password: [],
  })
  const onSubmit = useCallback((e) => {
    e.preventDefault();
    // setErrors({ username: [], password: [] })   // 这里进行清空errors不会马上跟新，hooks所有变量在下一个render才会更新
    // console.log(errors)
    axios.post('/api/v1/sessions', formData)
      .then((res) => {
        window.alert('登录成功');
        const return_to = getParam(window.location.search, 'return_to');
        if (return_to) {
          window.location.href = return_to;
        } else {
          window.location.href = "/posts/list";
        }

      }).catch((error) => {
        // console.log('error:', error.response);
        if (error.response) {
          const response: AxiosResponse = error.response;
          if (response.status === 422) {
            // setErrors({ ...errors, ...response.data.errors });
            setErrors({ ...response.data });   // 每次只获取最新的errors
          }
        }
      })
  }, [formData])
  return (
    <>
      {
        props.user && <div>当前登录用户为：{props.user.username}</div>
      }
      <h1>登录</h1>
      <form onSubmit={onSubmit}>
        <div>
          <label>用户名
            <input value={formData.username} onChange={e => setFormData({
            ...formData,
            username: e.target.value
          })} />
          </label>
          {
            errors.username && errors.username.length > 0 ?
              <div>{errors.username.join(' ')}</div> : null
          }
        </div>
        <div>
          <label>密码
            <input type="password" value={formData.password} onChange={e => setFormData({
            ...formData,
            password: e.target.value
          })} />
          </label>
          {
            errors.password && errors.password.length > 0 ?
              <div>{errors.password.join(' ')}</div> : null
          }
        </div>
        <div>
          <button type="submit">登录</button>
        </div>
      </form>
    </>
  )
}

export default SignUp;


// 通过SSR获取数据库相关信息
export const getServerSideProps: GetServerSideProps<any, { id: string }> = withSession(
  async (context: GetServerSidePropsContext) => {
    //@ts-ignore
    const user = context.req.session.get('currentUser');
    return {
      props: {
        user: JSON.parse(JSON.stringify(user || ''))
      }
    };
  });
