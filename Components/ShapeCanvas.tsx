

/**
 * An experiment to move most of the canvas drawing functionality into here to isolate it from the location page
 * It will need a number of props so it can be controlled by that page still
 * 
 * heavily specialized to my use case I don't need to, but if I generalized it a little, a few features that might be useful
 * - save: if we aren't editing id keyed shapes but generating new data from scratch, another CB for the whole data set
 */

import { useCanvas } from "@/Utils/useCanvas"
import { PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"

export type Point = {
    x: number
    y: number
}

export type Shape = {
    id?: string // id needed to associate when shape changes to callback, if not present should it even make the call?
    color?: string
    points: Point[]
}

export const ShapeCanvas = ({
    shapes,
    shapeChangeCB,
    selectedId,
    onSelect,
    width = 1000,
    height = 1000,
    style,
}: {
    shapes: Shape[],
    shapeChangeCB: (shape: Shape, index: number) => void,
    selectedId?: string | null,
    onSelect?: (id: string | null) => void,
} & React.ComponentPropsWithoutRef<"canvas">) => {
    const [localSelection, setLocalSelection] = useState<string | null>(null)

    const downPosition = useRef<Point | null>(null)
    const hasMoved = useRef<boolean>(false)
    const [translation, setTranslation] = useState<Point|null>(null)
    const dragIndex = useRef<number[]|null>(null)

    const shapePaths = useMemo(() => {
        return shapes.map((shape => {
            const path = new Path2D()
            path.moveTo(shape.points?.[0]?.x ?? 0, shape.points?.[0]?.y ?? 0)
            for (let i = 1 ; i < shape.points.length ; i++) {
                path.lineTo(shape.points[i].x, shape.points[i].y)
            }
            path.closePath()
            return path
        }))
    },[shapes])

    const managed = selectedId !== undefined
    const trueSelectedId = managed ? selectedId : localSelection
    const selectedShape = trueSelectedId && shapes.find((shape) => shape.id === trueSelectedId) || null

    const selectId = (id: string | null) => {
        if (onSelect) {
            onSelect(id)
        }
        if (!managed) {
            setLocalSelection(id)
        }
    }

    const getTranslatedPoints = (shape: Shape, translation: Point, translationIndex: number | null): Point[] => {
        console.log(shape, translation, translationIndex)
        return shape.points.map((point, pi) => ({
            x: point.x + (translationIndex === pi || translationIndex === null ? translation.x : 0),
            y: point.y + (translationIndex === pi || translationIndex === null ? translation.y : 0),
        }))
    }
        
    

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0,0,Number(width),Number(height))
        ctx.save()
        // this draws paths in normal order except the selected ID path if exists
        shapes.forEach((shape, shapei) => {
            if (shape.id === trueSelectedId) {
                return // don't draw this yet, not changing it's order in the array, just hoisting it temporarily while it's selected
                // issues will arise if more than one shape has the same id, only the last will be selectable in that case... or no ID at all
                // that might be an argument for just using indices, not sure... I'll consider the problem
            }

            ctx.lineWidth = 2
            ctx.strokeStyle = 'black'
            ctx.fillStyle = shape.color ?? 'black'
            // possibly memoize this path creation, if we only create a new path2d whe it's different, but it must be done without storing each value during a drag event, easy way to create a memory leak
            // this reduce calls lineTo first instead of moveTo, this is considered bad practice in documents I read. If this is the way I end up handling this I'll try to improve this
            // ctx.fill(shape.points.reduce((path, point) => { path.lineTo(point.x, point.y); return path }, new Path2D()))
            ctx.fill(shapePaths[shapei])
        })
        if (selectedShape) {
            ctx.strokeStyle = 'white'
            ctx.fillStyle = selectedShape.color ?? 'blue'
            ctx.lineWidth = 2

            const drawPoints = (dragIndex.current && translation) ? getTranslatedPoints(shapes[dragIndex.current[0]], translation, dragIndex.current[1] ?? null) : selectedShape.points
            if (drawPoints.length) {
                const handlePath = new Path2D()
                handlePath.moveTo(drawPoints[0].x, drawPoints[0].y)
                handlePath.arc(drawPoints[0].x, drawPoints[0].y, 8, 0, 2*Math.PI)
                const selectedShapePath = new Path2D()
                selectedShapePath.moveTo(drawPoints[0].x, drawPoints[0].y)
                for (let i = 1; i < drawPoints.length; i++) {
                    selectedShapePath.lineTo(drawPoints[i].x, drawPoints[i].y)
                    handlePath.moveTo(drawPoints[i].x, drawPoints[i].y)
                    handlePath.arc(drawPoints[i].x, drawPoints[i].y, 8, 0, 2*Math.PI)
                }
                selectedShapePath.closePath()
                ctx.fill(selectedShapePath)
                ctx.stroke(selectedShapePath)
                ctx.fillStyle = "yellow"
                ctx.fill(handlePath)
            }
        }
        ctx.restore()
    }, [width, height, selectedShape, trueSelectedId, shapePaths, translation, shapes])
    const {ref, ctx, element} = useCanvas({contextType: '2d', draw})
    useEffect(() => {
        if (ctx) {
            draw?.(ctx)
        }
    }, [draw, ctx])

    const pointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
        // e.width
        // e.height
        // e.clientX
        // e.clientY
        // e.pointerId
        if (!element) return // realistically the pointerDown event can't happen unless the element exists, but 

        const rect = element.getBoundingClientRect()
        const canvasX = (e.clientX - rect.x)/rect.width * Number(width)
        const canvasY = (e.clientY - rect.y)/rect.height * Number(height)
        downPosition.current = { x:canvasX, y:canvasY }
        hasMoved.current = false
    }

    const pointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
        // if the down didn't happen within the canvas we don't pay attention, and element should always be defined by the time we get this far but the edge case is handled anyway
        if (!downPosition.current || !element) return

        const rect = element.getBoundingClientRect()
        const canvasPos = { x: (e.clientX - rect.x)/rect.width*Number(width), y: (e.clientY - rect.y)/rect.height*Number(height) }
        // if mouse has moved more than 4 'canvas' pixels
        if (!hasMoved.current && Math.pow(canvasPos.x - downPosition.current.x, 2) + Math.pow(canvasPos.y - downPosition.current.y, 2) > Math.pow(4,2)) {
            hasMoved.current = true
            if (selectedShape) {
                const handleIndex = selectedShape.points.findIndex(p => {
                    const hp = new Path2D()
                    hp.arc(p.x, p.y, 8, 0, 2*Math.PI)
                    return ctx?.isPointInPath(hp, downPosition.current.x, downPosition.current.y)
                })
                if (handleIndex > -1) {
                    // found a handle to drag
                    dragIndex.current = [shapes.indexOf(selectedShape), handleIndex]
                } else if (ctx?.isPointInPath(shapePaths[shapes.indexOf(selectedShape)], downPosition.current.x, downPosition.current.y)) {
                    dragIndex.current = [shapes.indexOf(selectedShape)]
                }
            }
        }

        if (hasMoved && dragIndex) {
            // set translation but only if there is something to drag, doesn't matter if we're not dragging anything
            // is shift is held, snap to nearest 10? maybe?
            const snapToGrid = e.getModifierState('Shift') ? 10 : .001
            setTranslation({
                x: Math.round((canvasPos.x - downPosition.current.x)/snapToGrid) * snapToGrid,
                y: Math.round((canvasPos.y - downPosition.current.y)/snapToGrid) * snapToGrid,
            })
        }
    }

    const pointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
        if (!downPosition.current || !element) return
        const rect = element.getBoundingClientRect()
        // not sure if I need this, the moves should be enough to get the final position, but testing will show if that assumption is correct
        const canvasPos = { x: (e.clientX - rect.x)/rect.width*Number(width), y: (e.clientY - rect.y)/rect.height*Number(height) }

        if (!hasMoved.current) {
            // if the mouse never entered a "drag" state, then we assume they are selecting a shape
            // I'm using downPos to avoid grabbing additional data if I can avoid it

            const foundShape = shapes.findLast(shape => ctx?.isPointInPath(shape.points.reduce((path, point) => { path.lineTo(point.x, point.y); return path }, new Path2D()), downPosition.current.x, downPosition.current.y))
            if (foundShape && foundShape.id) {
                selectId(foundShape.id)
            } else {
                selectId(null)
            }
        } else {
            // hasMoved.current is truthy
            // if there is a dragIndex and a translation I think that accurately means we have moved a shape.
            //  Call parent callback with shape and altered points, I think we need to also provide index id because ids are not required, parent might use them, but we can't assume that
            if (dragIndex.current && translation) {
                const newShape = {
                    ...shapes[dragIndex.current[0]], //copies id and color if exist
                    points: getTranslatedPoints(shapes[dragIndex.current[0]], {...translation}, dragIndex.current[1] ?? null),
                }
                shapeChangeCB?.(newShape, dragIndex.current[0])
            }
        }

        downPosition.current = null
        dragIndex.current = null
        setTranslation({x:0,y:0})
    }

    
    return <canvas
        ref={ref}
        width={width}
        height={height}
        style={style}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerLeave={pointerUp}
    ></canvas>
}