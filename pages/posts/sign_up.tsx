import { NextPage } from "next";

const SignUp: NextPage = () => {
  return (
    <>
      <h1>注册</h1>
      <form>
        <div>
          <label>用户名
            <input />
          </label>
        </div>
        <div>
          <label>密码
            <input />
          </label>
        </div>
        <div>
          <button type="submit">注册</button>
        </div>
      </form>
    </>
  )
}

export default SignUp;
