import { useState, useRef, PointerEvent, useEffect, Fragment } from 'react';

type Point = {
  x: number
  y: number
}

export type Shape = {
    id?: string // id needed to associate when shape changes to callback, if not present should it even make the call?
    color?: string
    points: Point[]
}

export function ShapeSVG({
  shapes,
  onSave,
  selectedIndex,
  onSelectIndex,
  width, // in this case, I only use these for viewbox, and for scaling reasons I need them to be number never percent or other length argument types... might be best to define my own prop in that case
  height,
  style,
}: {
  shapes: Shape[],
  onSave: (s:Shape, i:number) => void,
  selectedIndex?: number | null,
  onSelectIndex?: (index: number | null) => void
} & React.ComponentPropsWithoutRef<'svg'>) {
  const svgElement = useRef<SVGSVGElement>(null)
  const [scale, setScale] = useState<number>(1)

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
        onSelectIndex?.(id)
        if (!managedIndex) {
            setLocalSelection(id)
        }
    }

  const [dragTranslation, setDragTranslation] = useState<{snap: boolean} & Point>({x: 0, y: 0, snap: false})
  
  const [dragInfo, setDragInfo] = useState<{
    dragging: boolean
    vertexIndex: number | null // which handle is being dragged, if null, the whole polygon
    startX: number
    startY: number
  }>({ dragging: false, vertexIndex: null, startX: 0, startY: 0 });

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
    if (!trueSelectedIndex) return
    console.log('Called insert')
    onSave({
      ...shapes[trueSelectedIndex],
      points: shapes[trueSelectedIndex].points.toSpliced(afterIndex, 0, {x,y})
    }, trueSelectedIndex)
  }

  const removeVertex = (index: number) => {
    if (!trueSelectedIndex) return
    onSave({
      ...shapes[trueSelectedIndex],
      points: shapes[trueSelectedIndex].points.toSpliced(index, 1)
    }, trueSelectedIndex)
  }

  const handleShapeMouseDown = (e: PointerEvent<SVGElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.button === 0) { // only start dragging if it's mainInteraction click
      const vertexIndex = e.currentTarget.dataset.vertexIndex ? Number(e.currentTarget.dataset.vertexIndex) : null
      console.log(e.button)
      const { x:svgX, y: svgY } = windowPosToSVGPosition(e.clientX, e.clientY)
      
      setDragInfo({
        dragging: true,
        vertexIndex,
        startX: svgX,
        startY: svgY
      })
    }
  }

  const handleMouseMove = (e: PointerEvent<SVGSVGElement>) => {
    const { dragging, startX, startY } = dragInfo;
    if (!dragging || trueSelectedIndex === null) return;

    const { x:svgX, y: svgY } = windowPosToSVGPosition(e.clientX, e.clientY)

    setDragTranslation({
      x: svgX - startX,
      y: svgY - startY,
      snap: e.getModifierState('Shift'),
    })
  }

  const translatePoints = (shp: Shape, ind: number) : Point[] => {
    return shp.points.map((point, pointIndex) => ({
      x: point.x, y: point.y,
      ... (
        dragInfo.dragging
        && trueSelectedIndex === ind
        && (
          dragInfo.vertexIndex === null
          || dragInfo.vertexIndex === pointIndex
        )
        ? {
          x: point.x + dragTranslation.x,
          y: point.y + dragTranslation.y
        } : {}
      ),
    }))
  }

  const handleMouseUp = (e: PointerEvent<SVGElement>) => {
    if (e.button === 0) {
      if (trueSelectedIndex !== null && dragInfo.dragging) {
        onSave({
          ...shapes[trueSelectedIndex],
          points: translatePoints(shapes[trueSelectedIndex], trueSelectedIndex)
        },
        trueSelectedIndex)
      }
      setDragInfo({ dragging: false, vertexIndex: null, startX: 0, startY: 0 })
      setDragTranslation({x:0, y:0, snap: false})
    } else if (e.button === 2) {
      // rather brashly I'm just deleting the node, there are much better options in the long run
      // if I delete down to 1 node no additional nodes can be added, 2 nodes at least can be expanded upon with the insert, but realistically a shape is pointless if it has less than 3 nodes, it can't be selected without external stuff I haven't set up yet
      if (e.target instanceof SVGGElement && e.target.dataset.vertexIndex) {
        removeVertex(Number(e.target.dataset.vertexIndex))
      }
    }
  };

  return (
      <svg
        ref={svgElement}
        style={style}
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
                onClick={(e) => {e.preventDefault();e.stopPropagation();selectIndex(shapeIndex)}}
                >
                <use
                  href={`#shape-${shapeIndex.toString().padStart(3,'0')}`}
                  fill={`${shape.color ?? '3b82f6'}4d`} //"rgba(59, 130, 246, 0.3)"
                />
                {shape.points.map((vertex, index) => (
                  <circle
                    key={index}
                    cx={vertex.x}
                    cy={vertex.y}
                    r={10/scale}
                    fill={`${shape.color}`}
                    style={{
                      filter: 'invert(100%)',
                    }}
                    stroke="#2563eb"
                    strokeWidth="2"
                    clipPath={`url(#shape-${shapeIndex.toString().padStart(3,'0')}-clip)`}
                    // onClick={(e) => {e.preventDefault();e.stopPropagation();selectIndex(shapeIndex)}}
                  />
                ))}
              </g>
            )
        })}
        {
          trueSelectedIndex !== null && 
          <g>
            <use
              href={`#shape-${trueSelectedIndex.toString().padStart(3,'0')}`}
              fill={`${shapes[trueSelectedIndex].color ?? '3b82f6'}4d`} //"rgba(59, 130, 246, 0.3)"
              stroke="#3b82f6"
              strokeWidth="2"
              // onClick={(e) => {e.preventDefault();e.stopPropagation()}}
              onPointerDown={(e) => handleShapeMouseDown(e)}
            />
            
            {(() => {
              const v = []
              const TP = translatePoints(shapes[trueSelectedIndex], trueSelectedIndex)
              for (let index = 0; index < TP.length; index++) {
                const vertex = TP[index]
                const vertex2 = TP[(index+1)%TP.length]
                v.push(<g key={index}><circle
                  cx={vertex.x}
                  cy={vertex.y}
                  r={10/scale}
                  fill={`${shapes[trueSelectedIndex].color}`}
                  style={{
                    filter: 'invert(100%)',
                    cursor: 'move',
                  }}
                  stroke="#2563eb"
                  strokeWidth="2"
                  data-vertex-index={index}
                  onPointerDown={(e) => handleShapeMouseDown(e)}
                /><text x={vertex.x} y={vertex.y} dominantBaseline='central'>☺</text></g>)
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
          </g>
        }
      </svg>
  );
}
