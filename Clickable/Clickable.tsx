import React from 'react'
import { handleOnClick } from '../../utils/Common/common'
import { Conditional } from '../Conditional/Conditional'

type ClickableProps = {
  onClick:()=>void
  className?:string
}

const Clickable = (props:React.PropsWithChildren<ClickableProps>) => (
  <span
    className={props.className}
    onClick={e => handleOnClick(e, props.onClick)}
    style={{ cursor:'pointer' }}
  >
    {props.children}
  </span>
)

type WrappedClickableProps = {
  [Property in keyof ClickableProps]?:ClickableProps[Property]
}
export const WrappedClickable = (props:React.PropsWithChildren<WrappedClickableProps>) => {
  return (
    <Conditional
      condition={ !!props.onClick }
      onTrue={ () => (
        <Clickable
          onClick={() => props.onClick!()}
          className={props.className}
        >
          {props.children}
        </Clickable>
      )}
      onFalse={() => (
        <>
          {props.children}
        </>
      )}
    />
  )
}

export default Clickable