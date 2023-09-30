import React from 'react'

type Props = {
  condition:boolean
  onTrue:() => React.ReactNode
  onFalse?:() => React.ReactNode
}

export const Conditional = (props:Props) =>
  <React.Fragment>
    {
      props.condition
        ? props.onTrue()
        : props.onFalse
          ? props.onFalse()
          : null
    }
  </React.Fragment>

type EntityConditionalProps<T> = {
  entity: T | null
  render: (_: T) => React.ReactNode
  fallback?: () => React.ReactNode
}

export const EntityConditional = <T extends {}>(props: EntityConditionalProps<T>) =>
  <Conditional
    condition={!!props.entity}
    onTrue={() => props.render(props.entity!)}
    onFalse={props.fallback}
  />