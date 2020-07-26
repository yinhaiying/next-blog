import { ChangeEventHandler, FormEventHandler, ReactChild } from 'react'

type Props = {
  fields: {
    label: string,
    type: 'text' | 'password',
    value: string | number,
    onChange: ChangeEventHandler<HTMLInputElement>,
    errors: string[]
  }[];
  onSubmit: FormEventHandler,
  buttons: ReactChild
}


export const Form: React.FunctionComponent<Props> = (props) => {
  return (
    <form onSubmit={props.onSubmit}>
      {
        props.fields.map((field) => {
          return (
            <div key={field.label}>
              <label >{field.label}
                <input type={field.type} value={field.value} onChange={field.onChange} />
              </label>
              {
                field.errors && field.errors.length > 0 ?
                  <div>{field.errors.join(' ')}</div> : null
              }
            </div>
          )
        })
      }
      <div>
        {
          props.buttons
        }
      </div>

    </form>
  )
}


