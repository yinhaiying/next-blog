import { NextPage } from 'next';
import { useState, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios'
const New: NextPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [errors, setErrors] = useState({
    title: [],
    content: [],
  });
  const onSubmit = useCallback((e) => {
    e.preventDefault();
    axios.post('/api/v1/posts', formData)
      .then((res) => {
        window.alert('添加成功');
      }).catch((error) => {
        if (error.response) {
          const response: AxiosResponse = error.response;
          if (response.status === 422) {
            setErrors({ ...response.data });   // 每次只获取最新的errors
          }
        }
      })
  }, [formData])
  return (
    <>
      <h2>添加博客</h2>
      {JSON.stringify(formData)}
      <form onSubmit={onSubmit}>
        <div>
          <label >标题
          <input type="text" value={formData.title} onChange={e => setFormData({
            ...formData,
            title: e.target.value
          })} />
          </label>
          {errors.title && errors.title.length > 0 ? <div>{errors.title.join(' ')}</div> : null}
        </div>
        <div>
          <label >内容
          <textarea value={formData.content} onChange={e => setFormData({
            ...formData,
            content: e.target.value
          })} />
          </label>
          {errors.content && errors.content.length > 0 ? <div>{errors.content.join(' ')}</div> : null}
        </div>
        <div>
          <button type="submit">提交</button>
        </div>
      </form>
    </>
  )
}
export default New;
