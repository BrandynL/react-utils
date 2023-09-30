import React from 'react'
import { createBrowserRouter,RouteObject,RouterProvider, useRouteError } from "react-router-dom"

export enum RouteType {
  PUBLIC="PUBLIC",
  PRIVATE="PRIVATE",
}
type RouteRenderHandleType = {
  render: React.ReactElement
}
type RouteBase = {
  paths:string[]
  errorElement?:React.ReactNode
} & RouteRenderHandleType

type PublicRouteKind = RouteBase & {
  kind:RouteType.PUBLIC
}

type PrivateRouteGateConfig = {
  allow:boolean
  onNotAllow:RouteRenderHandleType
}
type PrivateRouteKind = RouteBase & {
  kind:RouteType.PRIVATE
  gate:PrivateRouteGateConfig
}

type Route = PublicRouteKind | PrivateRouteKind

const routeGateRenderHandler = (x:Route):RouteRenderHandleType => {
  switch (x.kind){
    case RouteType.PUBLIC:
      return {
        render: x.render
      }
    case RouteType.PRIVATE:
      return x.gate.allow
        ? {
          render:x.render,
        } : {
          render:x.gate.onNotAllow.render,
        }
  }
}

export const useRouterErrors = () => useRouteError()

const DefaultErrorBoundary = () => {
  const errors = useRouterErrors()
  console.error('Errors during route render', errors)
  return (
    <React.Fragment>
      Something Unexpected Happened
    </React.Fragment>
  )
}

type ComposedBrowserRouterProps = {
  routes:Route[],
  defaultErrorElement?:React.ReactNode
}

const composeBrowserRouter = (props:ComposedBrowserRouterProps) => createBrowserRouter(
  props.routes.reduce((agg,x) => {
    const gatedRouteHandling = routeGateRenderHandler(x)
    return (
      // todo: remove duplication
      agg.concat(
        x.paths.map((path:string):RouteObject => ({
          path,
          element:gatedRouteHandling.render,
          errorElement:x.errorElement || props.defaultErrorElement || <DefaultErrorBoundary/>,
        }))
      )
    )
  }, [] as RouteObject[])
)

export const composeAppRoutingProvider = (props:ComposedBrowserRouterProps) => {
  const router = composeBrowserRouter(props)
  return (
    <RouterProvider router={router}/>
  )
}