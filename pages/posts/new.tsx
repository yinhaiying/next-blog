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
        window.location.href = "/posts/list";
      }).catch((error) => {
        if (error.response) {
          const response: AxiosResponse = error.response;
          if (response.status === 422) {
            setErrors({ ...response.data });   // 每次只获取最新的errors
          } else if (response.status === 401) {
            alert('请登录');
            window.location.href = `/posts/sign_in?return_to=${encodeURIComponent(window.location.pathname)}`
          }
        }
      })
  }, [formData])
  return (
    <>
      <form onSubmit={onSubmit} className="form-wrapper">
        <div>
          <label className="field-label">
            <span className="label-title">标题：</span>

            <input className="label-content" type="text" value={formData.title} onChange={e => setFormData({
              ...formData,
              title: e.target.value
            })} />
          </label>
          {errors.title && errors.title.length > 0 ? <div>{errors.title.join(' ')}</div> : null}
        </div>
        <div>
          <label className="field-label">
            <span className="label-title">内容：</span>
            <textarea className="label-content" value={formData.content} onChange={e => setFormData({
              ...formData,
              content: e.target.value
            })} />
          </label>
          {errors.content && errors.content.length > 0 ? <div>{errors.content.join(' ')}</div> : null}
        </div>
        <div className="btn">
          <button type="submit">提交</button>
        </div>
      </form>
      <style jsx>{

        `
        .form-wrapper{
          padding:16px;
        }
        .field-label{
          display:flex;
          margin-bottom:20px;
          margin-top:20px;
          box-sizing:border-box;

        }
        .field-label > .label-title{
          width:3.2em;
          white-space:nowrap;
        }
        .field-label > .label-content{
          flex:1;
          border:1px solid rgb(169, 169, 169);
        }
        .field-label > textarea.label-content{
          min-height:20em;
        }
        .btn{
          display:flex;
          justify-content:center;
          align-items:center;

        }
        .btn button{
          background:#007fff;
          outline:none;
          padding: 0.3em 1em;
          border:none;
          border-radius:3px;
          color:#fff;
          cursor:pointer;
        }

          `

      }</style>
    </>
  )
}
export default New;
