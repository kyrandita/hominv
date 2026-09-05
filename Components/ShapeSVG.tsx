import { useState, useRef, PointerEvent, useEffect, Fragment } from 'react';

import './shapeSVG.css'

type Point = {
  x: number
  y: number
}

export type Shape = {
  id?: string // id needed to associate when shape changes to callback, if not present should it even make the call?
  color?: string
  points: Point[]
}

enum InteractionMode {
  NORMAL,
  CREATE,
}

export function ShapeSVG({
  shapes,
  onSave,
  selectedIndex,
  setSelectedIndex,
  width, // in this case, I only use these for viewbox, and for scaling reasons I need them to be number never percent or other length argument types... might be best to define my own prop in that case
  height,
  style,
}: {
  shapes: Shape[],
  onSave: (s:Shape, i:number) => void,
  selectedIndex?: number | null,
  setSelectedIndex?: (index: number | null) => void
} & React.ComponentPropsWithoutRef<'svg'>) {
  const svgElement = useRef<SVGSVGElement>(null)
  const [scale, setScale] = useState<number>(1)
  const [InteractionState, setInteractionState] = useState<InteractionMode>(InteractionMode.NORMAL)

  useEffect(() => {
    if (!svgElement.current) return;
    const observer = new ResizeObserver(entries => {
      setScale(entries[0].contentRect.width / Number(2000)) // should reference the viewbox width, maybe switch svgElement to a callbackRef and do this there, assuming that will correctly get the latest "width" value each time the resize happens, I don't have a test for that currently
    })
    observer.observe(svgElement.current)
    return () => observer.disconnect()
  }, []);

  const [localSelection, setLocalSelection] = useState<number | null>(null)
  const managedIndex = selectedIndex !== undefined
  // TODO fix this to null if outside bounds of shape indices
  const trueSelectedIndex = managedIndex ? selectedIndex : localSelection
  const selectIndex = (id: number | null) => {
    setSelectedIndex?.(id)
    if (!managedIndex) {
      setLocalSelection(id)
    }
  }

  const [pivot, setPivot] = useState<Point | null>(null)
  const actualPivot = trueSelectedIndex !== null ? (pivot ?? ((shapes[trueSelectedIndex].points.length > 2 && shapes[trueSelectedIndex].points.reduce<Point>((carry, current) => {
    return {
      x: ((carry.x * shapes[trueSelectedIndex].points.length) + current.x) / shapes[trueSelectedIndex].points.length,
      y: ((carry.y * shapes[trueSelectedIndex].points.length) + current.y) / shapes[trueSelectedIndex].points.length,
    }
  }, { x:0, y:0 })) || null)) : null

  const [dragTranslation, setDragTranslation] = useState<({snap: boolean} & Point) | null>({x: 0, y: 0, snap: false})
  
  type dragState = {
    type: 'vertex'
    start: Point
    vertexIndex: number
  } | {
    type: 'rotate'
    start: Point
    startAngle: number
  } | {
    type: 'shape' | 'scale' | 'pivot'
    start: Point
  }

  const [dragInfo, setDragInfo] = useState<dragState | null>(null);

  const [newShapePoints, setNewShapePoints] = useState<Point[]>([]);

  const selectedIndexHistory = useRef(selectedIndex)

  useEffect(() => {
    if (selectedIndexHistory.current !== selectedIndex) {
      setInteractionState(InteractionMode.NORMAL)
      setDragInfo(null)
      setDragTranslation(null)
      setPivot(null)
      selectedIndexHistory.current = selectedIndex
    }
  }, [selectedIndex])

  const windowPosToSVGPosition = (mouseX:number, mouseY:number): Point => {
    if (!svgElement.current) return {x:mouseX, y:mouseY} // if the element isn't available we shouldn't even be in an event bound to it's existence on the page...
    const ctm = svgElement.current.getScreenCTM()?.inverse()
    const mouseWindowPos = svgElement.current.createSVGPoint()
    mouseWindowPos.x = mouseX
    mouseWindowPos.y = mouseY
    const {x, y} = mouseWindowPos.matrixTransform(ctm)
    return {x, y}
  }

  const insertVertex = (afterIndex: number, x:number, y:number) : void => {
    if (trueSelectedIndex === null) return
    onSave({
      ...shapes[trueSelectedIndex],
      points: shapes[trueSelectedIndex].points.toSpliced(afterIndex, 0, {x,y})
    }, trueSelectedIndex)
  }

  const removeVertex = (index: number) => {
    if (trueSelectedIndex === null) return
    onSave({
      ...shapes[trueSelectedIndex],
      points: shapes[trueSelectedIndex].points.toSpliced(index, 1)
    }, trueSelectedIndex)
  }

  /* svg heirarchy as planned
   * <svg>
   *   <defs></defs> <-- a polygon and clippath are setup here for each shape to be <use>(d) further so we only actually iterate the points once for an object per render unless it is being edited or drawn, in fact this might be a good candidate for a useMemo that only reruns when the shape data gets updated
   *   <g> <-- a <g> will exist at this level for each shape including the actively selected shape, it will have a data-shape-index property with the index of that shape within the shapes data
   *     <use> <-- the actual shape, technically it creates a shadow dom copy of the one in <defs> but this is how all draw properties are set for the actually drawn instance of that shape
   *     <g> <-- at this level all <g> elements are individual vertices, for shapes that aren't selected these are just drawn clipped to the shape, for selected shapes they are fully drawn and the <g> will contain a data-vertex-index
   *       <circle> <-- drawn visual representing the vertex, purely visual
   *       <text> <-- possibly used to draw a symbol for interaction on each vertex, might not stay, but also purely visual
   *     </g>
   *     // ONLY SELECTED
   *     <line> <-- between each vertex and it's neighbor a perpendicular line is drawn, an indicator of where a new vertex might be inserted. not shown if distance between vertices is too short
   *     <undetermined> <-- the drag part of the centroid pivot/rotate/scale tool
   *     <circle> <-- the rotate part of the centroid pivot/rotate/scale tool
   *     <rect> <-- scale part of the centroid pivot/rotate/scale tool
   *   </g>
   * </svg>
   */
  const handlePointerDown = (e: PointerEvent<SVGElement>) => {
    e.preventDefault()
    e.stopPropagation()
    switch (e.button) {
      case 0: { // main action click
        if (InteractionState == InteractionMode.NORMAL && trueSelectedIndex !== null) { // only check handles for drag events if in normal mode and there is a selection

          // determine target and therefore action
          const shapeTarget: SVGGElement | null = (e.target as SVGElement).closest('g[data-shape-index]')
          if (Number(shapeTarget?.dataset.shapeIndex) !== trueSelectedIndex) return // not dragging selection, event doesn't matter to this
          
          const { x:svgX, y: svgY } = windowPosToSVGPosition(e.clientX, e.clientY)

          const vertexTarget: SVGGElement | null = (e.target as SVGElement).closest('g[data-vertex-index')
          if (vertexTarget?.dataset.vertexIndex) {
            setDragInfo({
              type: 'vertex',
              vertexIndex: Number(vertexTarget.dataset.vertexIndex), // this is no longer enough, we can also drag for scale, rotation, and pivot tool repositioning, not just vertex and shape translation
              start: {x:svgX,y: svgY},
            })
            return
          }
          // I know the click happened within the selected shape and it's not a vertex
          
          // the actualPivot I think is redundant, this event shouldn't be possible if the pivot doesn't exist... but making typescript happy guards against weird code paths
          if (e.target instanceof SVGCircleElement && actualPivot) {
            const angle = Math.atan2(svgY - actualPivot.y, svgX - actualPivot.x)
            setDragInfo({
              type: 'rotate',
              start: {x:svgX, y:svgY},
              startAngle: angle
            })
            return
          }
          if (e.target instanceof SVGRectElement) {
            setDragInfo({
              type: 'scale',
              start: {x:svgX, y:svgY},
            })
            return
          }
          if (false) { // check for pivot drag handle, not sure what that is yet
            console.log('pivot')
            return
          }

          setDragInfo({
            type: 'shape',
            start: {x:svgX, y:svgY}
          })
          
        } else if (InteractionState === InteractionMode.CREATE) {
          // ignore target, will always add a new node to ongoing list until cancelled or finalized
          // happens on PointerUp
        }
      } break
      case 2: { // secondary action click

      } break
    }
  }

  const handleMouseMove = (e: PointerEvent<SVGSVGElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragInfo) { // no need to update state if no drag event is happening
      const { x:svgX, y: svgY } = windowPosToSVGPosition(e.clientX, e.clientY)
      
      setDragTranslation({
        x: svgX,
        y: svgY,
        snap: e.getModifierState('Shift'),
      })
    }
  }

  const translatePoints = (shp: Shape, ind: number) : Point[] => {
    // if not dragging or dragging the one thing that doesn't affect the points directly, skip translation
    if (!dragInfo || dragInfo.type == 'pivot' || trueSelectedIndex !== ind) return shp.points

    const mtrx = new DOMMatrix()
    if (['shape', 'vertex'].includes(dragInfo.type) && dragTranslation) {
      mtrx.translateSelf(dragTranslation.x - dragInfo.start.x, dragTranslation.y - dragInfo.start.y)
    } else if (dragInfo.type === 'rotate' && dragTranslation && actualPivot) {
      const currentAngle = Math.atan2(dragTranslation.y - actualPivot.y, dragTranslation.x - actualPivot.x)
      mtrx.translateSelf(actualPivot.x, actualPivot.y)
        .rotateSelf((currentAngle - dragInfo.startAngle) * (180/Math.PI))
        .translateSelf(-actualPivot.x, -actualPivot.y)
    } else if (dragInfo.type === 'scale' && dragTranslation && actualPivot) {
      const scale = {
        x: (dragTranslation.x - actualPivot.x) / (dragInfo.start.x - actualPivot.x),
        y: (dragTranslation.y - actualPivot.y) / (dragInfo.start.y - actualPivot.y),
      }
      mtrx.translateSelf(actualPivot.x, actualPivot.y)
        .scaleSelf(dragTranslation.snap ? Math.max(scale.x, scale.y) : scale.x, dragTranslation.snap ? Math.max(scale.x, scale.y) : scale.y)
        .translateSelf(-actualPivot.x, -actualPivot.y)
    }
    return shp.points.map((point, pointIndex) => {
      let p = new DOMPoint(point.x, point.y)
      if (dragInfo.type !== 'vertex' || pointIndex === dragInfo.vertexIndex)
        p = p.matrixTransform(mtrx)
      return { x: p.x, y: p.y }
    })
  }

  const handleMouseUp = (e: PointerEvent<SVGElement>) => {
    switch(e.button) {
      case 0: {
        if (InteractionState === InteractionMode.CREATE) {
          console.log('herer')
          const { x:svgX, y: svgY } = windowPosToSVGPosition(e.clientX, e.clientY)
          setNewShapePoints(prev => [...prev, {x: svgX, y: svgY}]);
        } else if (InteractionState === InteractionMode.NORMAL) {
          if (trueSelectedIndex !== null && dragInfo) {
            onSave({
              ...shapes[trueSelectedIndex],
              points: translatePoints(shapes[trueSelectedIndex], trueSelectedIndex)
            },
            trueSelectedIndex)
          } else if (e.target === e.currentTarget) { // if mouseup happens outside a shape, deselect
            selectIndex(null)
          }
          setDragInfo(null)
          setDragTranslation(null)
        }
      } break
      case 2: {
        const closest = (e.target as SVGElement).closest('g[data-vertex-index]')
        // rather brashly I'm just deleting the node, there are much better options in the long run
        // if I delete down to 1 node no additional nodes can be added, 2 nodes at least can be expanded upon with the insert, but realistically a shape is pointless if it has less than 3 nodes, it can't be selected without external stuff I haven't set up yet
        if (closest instanceof SVGGElement && e.currentTarget.contains(closest) && closest.dataset.vertexIndex) {
          removeVertex(Number(closest.dataset.vertexIndex))
        }
      } break
    }
  }

  const handleNewShapeComplete = () => {
    if (InteractionState === InteractionMode.CREATE && trueSelectedIndex !== null && newShapePoints.length > 2) { // Minimum points for a valid shape
      onSave({ ...shapes[trueSelectedIndex], points: newShapePoints }, trueSelectedIndex);
      setInteractionState(InteractionMode.NORMAL)
      setNewShapePoints([]);
    } else {
      // fine during testing and development, but if I truly make this it's own component this should be a specific event dispatched on "this" in the DOM sense, not a nota:toast event for sure, custom listeners can translate from one to the other if you are using a library like mine
      document.dispatchEvent(new CustomEvent('nota:toast', { detail: {
        class: 'warn',
        message: 'not enough points to create a shape, need at least 3',
      }}))
    }
  }

  const toggleNewShapeMode = () => {
    setInteractionState(prev => {
      if (prev === InteractionMode.NORMAL) {
        setNewShapePoints([])
        return InteractionMode.CREATE
      }
      return InteractionMode.NORMAL
    })
  }

  return (
    <div className='shapeSVG' style={style}>
      <svg
        ref={svgElement}
        onPointerDown={handlePointerDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        onPointerLeave={handleMouseUp}
        viewBox={`0 0 ${width} ${height}`}
        onContextMenu={(e) => e.preventDefault()}
      >
        <defs>
          {shapes.map((shp, ind) => {
            const translatedPoints = translatePoints(shp, ind)
            const pointsString = translatedPoints.map(p => `${p.x},${p.y}`).join(' ');
            return <Fragment key={`shape-${ind.toString().padStart(3,'0')}`}>
              <polygon
                id={`shape-${ind.toString().padStart(3,'0')}`}
                points={pointsString}
                fillRule='evenodd'
              ></polygon>
              <clipPath
                id={`shape-${ind.toString().padStart(3,'0')}-clip`}
              >
                <use href={`#shape-${ind.toString().padStart(3,'0')}`} />
              </clipPath>
            </Fragment>
          })}
        </defs>
        {shapes.map((shape, shapeIndex) => {
          return trueSelectedIndex === shapeIndex ? null : (
            <g
              key={shape.id}
              data-shape-index={shapeIndex}
              // TODO redo this to a single bound listener rather than a generated one, it might be best to merge with pointerDown
              onClick={(e) => {e.preventDefault();e.stopPropagation();selectIndex(shapeIndex)}}
              >
              <use
                href={`#shape-${shapeIndex.toString().padStart(3,'0')}`}
                fill={`${shape.color ?? '3b82f6'}`} //"rgba(59, 130, 246, 0.3)"
              />
              {shape.points.map((vertex, index) => (
                <g
                  key={index}
                >
                  <circle
                    cx={vertex.x}
                    cy={vertex.y}
                    r={10/scale}
                    fill={`${shape.color}`}
                    stroke="#2563eb"
                    strokeWidth="2"
                    clipPath={`url(#shape-${shapeIndex.toString().padStart(3,'0')}-clip)`}
                    // onClick={(e) => {e.preventDefault();e.stopPropagation();selectIndex(shapeIndex)}}
                  />
                </g>
              ))}
            </g>
          )
        })}
        {
          trueSelectedIndex !== null && 
          <g
            data-shape-index={trueSelectedIndex}
          // onPointerDown={handleShapeMouseDown}
          >
            <use
              href={`#shape-${trueSelectedIndex.toString().padStart(3,'0')}`}
              fill={`${shapes[trueSelectedIndex].color ?? '3b82f6'}`} //"rgba(59, 130, 246, 0.3)"
              stroke="#3b82f6"
              strokeWidth="2"
              // onClick={(e) => {e.preventDefault();e.stopPropagation()}}
              // onPointerDown={handleShapeMouseDown}
            />

            {(() => {
              const v = []
              const TP = translatePoints(shapes[trueSelectedIndex], trueSelectedIndex)
              for (let index = 0; index < TP.length; index++) {
                const vertex = TP[index]
                const vertex2 = TP[(index+1)%TP.length]
                v.push(
                  <g 
                    key={index}
                    data-vertex-index={index}
                    // onPointerDown={handleShapeMouseDown}
                    >
                      <circle
                        cx={vertex.x}
                        cy={vertex.y}
                        r={10/scale}
                        fill={`${shapes[trueSelectedIndex].color}`}
                        style={{
                          filter: 'invert(100%)',
                        }}
                        stroke="#2563eb"
                        strokeWidth="2"
                        data-vertex-index={index}
                        />
                      <text x={vertex.x} y={vertex.y}>☺</text>
                  </g>
                )
                const dx = vertex.x - vertex2.x
                const dy = vertex.y - vertex2.y
                const L =  Math.hypot(dx, dy)
                if (Math.abs(L) < 30/scale) continue // short lengths would hide the split between the handles, so hide short side splits
                const mx = (vertex.x + vertex2.x)/2
                const my = (vertex.y + vertex2.y)/2
                const nx = 10/scale * (-dy/L)
                const ny = 10/scale * (dx/L)
                v.push(<line
                  key={`${index}-split`}
                  x1={mx - nx}
                  y1={my - ny}
                  x2={mx + nx}
                  y2={my + ny}
                  strokeWidth={5}
                  stroke="#FFF"
                  onClick={(e) => {e.preventDefault();e.stopPropagation();insertVertex(index + 1, mx, my)}}
                ></line>)
              }
              return v
            })()}
            {actualPivot && <>
              <circle
                cx={actualPivot.x}
                cy={actualPivot.y}
                r={20}
                fill='none'
                stroke='white'
                strokeWidth={5}
                strokeDasharray={Math.PI * 10}
                strokeDashoffset={Math.PI * 10}
              ></circle>
              <rect
                x={actualPivot.x - 20}
                y={actualPivot.y - 20}
                width={40}
                height={40}
                stroke='white'
                strokeWidth={5}
                strokeDasharray={40}
                strokeDashoffset={20}
                fill='none'
              ></rect>
            </>}
          </g>
        }
        {InteractionState === InteractionMode.CREATE && (
          <g>
            <polygon points={newShapePoints.map(p => `${p.x},${p.y}`).join(' ')}></polygon>
            {newShapePoints.map((point, index) => (
              <g
                key={index}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={10/scale}
                  fill="red"
                  style={{
                    filter: 'invert(100%)',
                  }}
                  stroke="#2563eb"
                  strokeWidth="2"
                />
              </g>
            ))}
          </g>
        )}
      </svg>
      {trueSelectedIndex !== null && <div>
        <button onClick={handleNewShapeComplete} hidden={InteractionState === InteractionMode.NORMAL} disabled={InteractionState === InteractionMode.NORMAL}>
          Complete Shape
        </button>
        <button onClick={toggleNewShapeMode} className={`${InteractionState === InteractionMode.CREATE ? 'warn' : ''}`}>
          {InteractionState === InteractionMode.CREATE ? "Stop Drawing" : "Start Drawing"}
        </button>
      </div>}
    </div>
  );
}
