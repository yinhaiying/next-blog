import { NextPage } from "next";
import { useState, useCallback } from 'react'
import axios, { AxiosResponse } from 'axios'
import { AxiosError } from 'axios'
const SignUp: NextPage = () => {

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
