import React from 'react'

export type Union<Key extends string, T> = {
  case: Key;
  value: T;
};
export type DiscriminatedUnion<U extends Union<string, any>[]> = U[number]

type DiscriminatedUnionProps<
  V extends {},
  K extends string,
  T extends Union<K, V>[],
  U extends DiscriminatedUnion<T>,
  TReturn
> = {
  value: U
  config: {
    [Property in U["case"]]: (v: Extract<U, { case: Property }>['value']) => TReturn
  }
}

export const handleDiscriminatedUnion = <
  V extends {},
  K extends string,
  T extends Union<K, V>[],
  U extends DiscriminatedUnion<T>,
  TReturn
  >(props: DiscriminatedUnionProps<V, K, T, U, TReturn>) =>
    props.config[props.value.case](props.value.value)


export const DiscriminatedUnionHandler = <
  V extends {},
  K extends string,
  T extends Union<K, V>[],
  U extends DiscriminatedUnion<T>,
>(
  props: DiscriminatedUnionProps<V, K, T, U, React.ReactNode>
) => (
  <>
    {handleDiscriminatedUnion(props)}
  </>
)