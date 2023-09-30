import React from 'react'
import update from 'immutability-helper'
import type { Identifier, XYCoord } from 'dnd-core'
import { useCallback, useRef } from 'react'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

export enum SortThreshold {
	Vertical,
	Horizontal
}

interface SortableItemProps<T extends string> {
	id: any
	index: number
	onSort: (dragIndex: number, hoverIndex: number) => void
  type: T
	sort:SortThreshold
	className?:string
}

interface DragItem {
	index: number
	id: string
}

const SortableItem = <T extends string>(props:React.PropsWithChildren<SortableItemProps<T>>) => {
	const ref = useRef<HTMLDivElement>(null)
	const [{ handlerId }, drop] = useDrop<
		DragItem,
		void,
		{ handlerId: Identifier | null }
	>({
		accept: props.type,
		collect:(monitor) => ({
				handlerId: monitor.getHandlerId(),
		}),
		hover(item: DragItem, monitor) {
			if (!ref.current) {
				return
			}
			const dragIndex = item.index
			const hoverIndex = props.index

			// Don't replace items with themselves
			if (dragIndex === hoverIndex) {
				return
			}

			// Determine rectangle on screen
			const hoverBoundingRect = ref.current?.getBoundingClientRect()

			// Get vertical middle
			const hoverMiddleY =
				(hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
			// Get horizontal middle
			const hoverMiddleX =
				(hoverBoundingRect.left - hoverBoundingRect.right) / 2

			// Determine mouse position
			const clientOffset = monitor.getClientOffset()

			// Get pixels to the top
			const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top
			// Get pixels to the right
			const hoverClientX = (clientOffset as XYCoord).x - hoverBoundingRect.right

			// Only perform the move when the mouse has crossed half of the items height or width
			switch (props.sort) {
        case SortThreshold.Vertical:
          // When dragging downwards, only move when the cursor is below 50%
					if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
          // When dragging upwards, only move when the cursor is above 50%
					if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return
					break
        case SortThreshold.Horizontal:
          // When dragging left, only move when the cursor is past 50% left
          if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return
          // When dragging right, only move when the cursor is past 50% right
          if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return
          break
			}

			// Time to actually perform the action
			props.onSort(dragIndex, hoverIndex)

			// Note: we're mutating the monitor item here!
			// Generally it's better to avoid mutations,
			// but it's good here for the sake of performance
			// to avoid expensive index searches.
			item.index = hoverIndex
		},
	})

	const [{ isDragging }, drag] = useDrag({
		type: props.type,
		item: () => {
			return { id:props.id, index:props.index }
		},
		collect: (monitor: any) => ({
			isDragging: monitor.isDragging(),
		}),
	})

	const opacity = isDragging ? 0.75 : 1
	drag(drop(ref))
	return (
		<div
			ref={ref}
			style={{ opacity }}
			data-handler-id={handlerId}
			className={props.className}
		>
			{props.children}
		</div>
	)
}

type RenderItemConfig<T> = {
	render:(_:T) => React.ReactNode
	className?:string
}
type SortableProps<T,K extends string> = {
  type:K
  items:T[]
  onResort:(_:T[])=>void
  renderItem:RenderItemConfig<T>
  parseKey:(_:T) => React.Key
	sort:SortThreshold
}
export const Sortable = <T,K extends string>(props:SortableProps<T,K>) => {

  const handleSort = useCallback((dragIndex: number, hoverIndex: number) => {
    props.onResort(
      update(props.items, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, props.items[dragIndex]],
        ],
      })
    )
  }, [props])

  return (
    <DndProvider backend={HTML5Backend}>
			{props.items.map((item,index) =>
				<SortableItem
					sort={props.sort}
					id={props.parseKey}
					index={index}
					onSort={handleSort}
					type={props.type}
					key={props.parseKey(item)}
					className={props.renderItem.className}
				>
					{props.renderItem.render(item)}
				</SortableItem>
			)}
    </DndProvider>
  )
}