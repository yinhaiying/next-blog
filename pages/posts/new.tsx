import { NextPage } from 'next';
import { Form } from '../../components/Form';
import { useState } from 'react';
const Postsnew: NextPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    username: [],
    password: [],
  });
  return (
    <div>
      <Form fields={[
        {
          label: '用户名',
          type: 'text',
          value: formData.username,
          onChange: e => setFormData({
            ...formData,
            username: e.target.value
          }),
          errors: errors.username
        },
        {
          label: '密码',
          type: 'password',
          value: formData.password,
          onChange: e => setFormData({
            ...formData,
            password: e.target.value
          }),
          errors: errors.password
        }]} onSubmit={() => { alert(1) }} buttons={
          <>
            <button type="submit">添加</button>
          </>
        }>
      </Form>
    </div>
  )
}
export default Postsnew;
