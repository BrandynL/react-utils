import React from 'react'

export const contextBuilder = <T extends {}>(context:T) => React.createContext<T>(context)

export const contextDispatchBuilder = <T extends {}>() =>
  React.createContext<React.Dispatch<T>>(() => {})

type ContextProviderType<T> = {
  context:React.Context<T>
  contextDispatcher:React.Context<React.Dispatch<T>>
  defaultContext:T
}

export const ContextProvider = <T extends {}>(props:React.PropsWithChildren<ContextProviderType<T>>) => {

  const defaultContextReducer = (prevCTX:T, nextCTX:T): T => ({
    ...prevCTX,
    ...nextCTX
  })
  
  const [context, dispatcher] = React.useReducer(defaultContextReducer, props.defaultContext);

  return (
    <props.context.Provider value={context}>
      <props.contextDispatcher.Provider value={dispatcher}>
        {props.children}
      </props.contextDispatcher.Provider>
    </props.context.Provider>
  )
}