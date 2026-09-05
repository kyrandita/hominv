'use client'

import Canvas from "@/Components/Canvas";
import { Shape, ShapeCanvas } from "@/Components/ShapeCanvas";
import { ShapeSVG } from "@/Components/ShapeSVG";
import { LocationReturn } from "@/Utils/fakeData.js";
import { tupleize } from "@/Utils/functions";
import { useCanvas } from "@/Utils/useCanvas";
import { useFetch } from "@/Utils/useFetch";
import Image from "next/image"
import Link from "next/link";
import { MouseEventHandler, useCallback, useEffect, useMemo, useState } from "react";
import {} from '@/Components/ColorPicker'

import './page.css'

type SubLocShape = {
    stroke: CanvasFillStrokeStyles['strokeStyle'] ,
    fill: CanvasFillStrokeStyles['fillStyle'],
    path: Path2D,
    handles: [number, number][]
    handles2: {x:number, y:number, path?: Path2D, color?: string}[]
}

export default function LocationPage({params} : {params: Promise<{ slug: string[] }>}) {
    const [slug, setSlug] = useState<string | undefined>()
    const {data:locationData, error, loading } = useFetch<LocationReturn>((slug ? `/api/location/${slug}` : undefined))
    // const [paths, setPaths] = useState<SubLocShape[]>([])
    const [shapes, setShapes] = useState<Shape[] | null>(null)

    // const [dragHandle, setDragHandle] = useState<Array<number> | null>(null)
    const [sublocindex, setSublocindex] = useState<number | null>(null)

    useEffect(() => {
        (async () => {
            const { slug } = await params;
            setSlug(slug.join('/'))
        })()
    }, [ params ])

    useEffect(() => {
        if (locationData) {(async () => { // this IIFE is just to avoid a react error, this should actually be triggered as a callback from the fetch once I figure out how I want that to look
            const shapeData = locationData.sub.map<Shape>((location, index) => {
                const points: {x:number,y:number}[] = []
                if (location.quad && location.quad.length % 2 === 0) {
                    for (let point = 0; point < location.quad.length; point += 2) {
                        points.push({x: location.quad[point], y: location.quad[point + 1]})
                    }
                }
                return {
                    id: index.toString(), // perhaps a real DB id would be better, but as long as it's consistent within the run of the app
                    ...(location.rgb ? {color: `#${location.rgb.toString(16).padStart(6,'0')}`} : {}),
                    points,
                }
            })
            setShapes(shapeData)
        })()}
        
    }, [locationData])

    // const canvasDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    //     ctx.clearRect(0,0,1000,1000)
    //     // this draws paths in normal order
    //     paths.forEach((p) => {
    //         ctx.lineWidth = 2
    //         ctx.strokeStyle = 'black'
    //         ctx.fillStyle = p.fill
    //         ctx.fill(p.path)
    //         // ctx.stroke(p.path)
    //         // p.handles.forEach(shapePoints => {
    //         ctx.strokeStyle = 'white'
    //         ctx.fillStyle = 'blue'
    //         ctx.lineWidth = 3
    //         for (let i = 0; i < p.handles2.length; i++) {
    //             // drawing handles here will draw under later shapes, possibly draw handles after if they are to be grabbable through other shapes... priority of overlapping handles will have to be determined
    //             const prev = p.handles2.at(i-1) ?? {x:0,y:0}
    //             const h = p.handles2.at(i) ?? {x:0,y:0} //  this default is dumb, typescript doesn't recognize that this is impossible to reach here without a legit value?
    //             const next = i+1 < p.handles.length ? p.handles2.at(i+1) ?? {x:0,y:0} : p.handles2.at(0) ?? {x:0,y:0}
    //             const hp = new Path2D()
    //             hp.moveTo(h.x, h.y)
    //             hp.ellipse(h.x, h.y, 15, 15, 0, Math.atan2(next.y - h.y, next.x - h.x), Math.atan2(prev.y - h.y, prev.x - h.x))
    //             // these angles can be calculated once when the locations are loaded, though I'll still have to do some of it dynamically as the handles are dragged...
    //             // ctx.closePath()
    //             h.path = hp
    //             ctx.fillStyle = h.color ?? 'blue'
    //             ctx.fill(hp)
    //             // ctx.stroke()
    //         }
    //         // })
    //     })
    // }, [paths])
    // const { ref: canvasRef, ctx: controlContext, element: controlElement } = useCanvas({draw: canvasDraw, contextType: '2d'})

    // const updatePaths = (pos:{x:number, y:number}) => {
    //     // not sure whether I want props or to just update based on current state... will use state for now
    //     if (!dragHandle) return
    //     const newPaths:SubLocShape[] = paths.map((path, i) => {
    //         // this path is not being updated just return it unchanged, if I switch to Pointer Events I may have to consider more than one drag happening at once, but not a concern for now
    //         if (dragHandle[0] !== i) return path
    //         let first = true
    //         return {
    //             ...path,
    //             path: (() => {
    //                 const np = path.handles2.reduce<Path2D>((acc, cur, curri) => {
    //                     let x = cur.x, y = cur.y
    //                     if (curri == dragHandle[1]) {
    //                         x = pos.x
    //                         y = pos.y
    //                     }
    //                     if (first) {
    //                         acc.moveTo(x,y)
    //                         first = false
    //                     } else {
    //                         acc.lineTo(x,y)
    //                     }
    //                     return acc
    //                 }, new Path2D())
    //                 np.closePath()
    //                 return np
    //             })(),
    //             handles2: path.handles2.map((h, hi) => {
    //                 if (dragHandle[1] !== hi) return h
    //                 return {
    //                     ...h,
    //                     x: pos.x,
    //                     y: pos.y,
    //                 } 
    //             })
    //         }
    //     })
    //     setPaths(newPaths)
    // }

    // const handleCanvasMouseMove: MouseEventHandler<HTMLCanvasElement> = (e: React.MouseEvent<HTMLCanvasElement>) => {
    //     // console.log(e)
    //     if (controlElement) {
    //         const rect = controlElement.getBoundingClientRect()
    //         const canvasX = (e.clientX - rect.x)/rect.width*1000
    //         const canvasY = (e.clientY - rect.y)/rect.height*1000
    //         // const context = canvasRef.current.getContext('2d')
    //         if (!controlContext) return
    //         controlContext.clearRect(0,0,1000,1000)// not sure if clearing when nothing changes is worth optimizing out, but as a thought for later if it's performance breaking
            
    //         // paths.forEach(path => {
    //         //     // if (context?.isPointInPath(path.path, canvasX, canvasY)) {
    //         //     //     context.fillStyle = 'orange'
    //         //     //     context.fill(path.path)
    //         //     // }
    //         //     // path.handles2.forEach(handle => {
    //         //     //     if (context?.isPointInPath(handle.path, canvasX, canvasY)) {
    //         //     //         context.fillStyle = 'green'
    //         //     //         context.fill(handle.path)
    //         //     //     }
    //         //     // })
    //         //     // indicates it may be best to store handles as paths for detection...
    //         //     // but I have to remember which path I'm updating when dragging and update the paths
    //         //     // associated without losing that reference...
    //         //     // maybe pathID for one type of focus, mouse point for another to the rendering function?
    //         //     // I'd certainly prefer avoiding redrawing the whole canvas each movement of the mouse,
    //         //     // only trigger if the focused/hovered element changes or if they're dragging and positions
    //         //     // actually shift, otherwise not redrawing seems best

    //         //     // MDN suggested multiple layered canvases for things like this actually, I could have a handle/edit
    //         //     // layer where I draw things when dragging/hovering, leaving the lower layer to only render when I
    //         //     // put that object back in the set...

    //         //     // path.handles.forEach(phandle => {
    //         //     // })
    //         // })
    //         if (dragHandle) {
    //             // const spot = new Path2D()
    //             // spot.moveTo(canvasX, canvasY)
    //             // spot.arc(canvasX, canvasY, 3, 0, 2*Math.PI)
    //             // context.fillStyle='white'
    //             // context.fill(spot)
    //             // const xDiff = Math.round(canvasX - paths[dragHandle[0]].handles2[dragHandle[1]].x)
    //             // const yDiff = Math.round(canvasY - paths[dragHandle[0]].handles2[dragHandle[1]].y)
    //             // context.strokeText(`[${xDiff}, ${yDiff}]`, canvasX, canvasY)
    //             updatePaths({ x: canvasX, y: canvasY })
    //             // the draw function triggers on updating the path data... I need to write a function that takes the handle beign dragged and rebuilds the data with the change so the underlying canvas will redraw with the new handle position
    //             // I should realistically only need to actually recreate the single handle object and the path for the shape it belongs to
    //             // this also might replace some of the initializing behavior if I redo that to rely on just sets of handles... not sure yet
    //         }
    //     }
    // }

    // const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    //     if (controlElement && controlContext) {
    //         const rect = controlElement.getBoundingClientRect()
    //         const canvasX = (e.clientX - rect.x)/rect.width*1000
    //         const canvasY = (e.clientY - rect.y)/rect.height*1000
    //         // const context = canvasRef.current.getContext('2d')
    //         const context = controlContext
    //         // reverse order so it should select the 'top' or later drawn element, to feel intuitive
    //         // BUG: if you cross handles so the lines overlap, the condition of only checking a shapes
    //         // handles if 'within' the shape doesn't work, as well as the handle is inverted (handle drawing
    //         // assumes a clockwise point layout). either remove the condition for checking shapes AND handles
    //         // and only check handles, and probably without assuming clockwise orientation, just as a node
    //         // or force the users shapes into clockwise form by swwapping handles when overlaps occur... that
    //         // is a difficult solution though I think, with only 1 crossing side it's apparent which handles
    //         // should be swapped, but every other scenario it's difficult to know what the user might be intending
    //         // so solution 1 seems the better choice, however nodes that technically exist on the same x,y
    //         // position or near enough the use couldn't easily hover over only 1 within the radius of selection
    //         // might have to do some directionality detection to determine which of the nodes has more 'control'
    //         // over the cursor position, obviously falling back to 'top' shape if all else is equal, that might
    //         // be overkill anyway and just doing 'top' would be enough for first implementation with some other
    //         // mechanism to toggle between active and next priority node when there is more than 1 at the cursor
    //         for (let s = paths.length-1; s >= 0 ;s--) {
    //             if (!context.isPointInPath(paths[s].path, canvasX, canvasY)) {
    //                 console.log(`skipping ${s}`)
    //                 continue
    //             }
    //             const handlei = paths[s].handles2.findIndex(h => {
    //                 return context?.isPointInPath(h.path, canvasX, canvasY)
    //             })
    //             if (handlei >= 0) {
    //                 setDragHandle([s,handlei])
    //                 // stop searching, we found an appropriate handle on the uppermost shape
    //                 break
    //             }
    //         }

    //         // if not on a handle or in a shape, we may be trying to add/remove a handle, or possibly
    //         // create a new shape for a sublocation that doesn't yet have one... Will have to consider how
    //         // the UX on that should be
    //     }
    // }
    // const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    //     // don't know if this is needed yet
    //     // might want to clear the upper canvas, doesn't clear the last draw of the drag if they don't move
    //     // but that's more visible with mu debug text and stuff, may not be necessary

    //     if (controlElement && controlContext) {
    //     //     const rect = canvasRef.current.getBoundingClientRect()
    //     //     const canvasX = (e.clientX - rect.x)/rect.width*1000
    //     //     const canvasY = (e.clientY - rect.y)/rect.height*1000
    //     //     const context = canvasRef.current.getContext('2d')
    //         // updatePath()
    //     }
    //     if (dragHandle) {
    //         // a last updatePaths? probably not needed
    //         // TODO trigger save changed path to location
    //         setDragHandle(null)
    //         // console.log(paths)

    //     }
    // }

    const handleShapeUpdate = (updatedShape: Shape, updatedIndex: number) => {
        setShapes(shapes?.map((shape, index) => {
            return {
                ...shape,
                ...(updatedIndex === index ? updatedShape : {}),
            }
        }) ?? null)
        // this sets them locally for now, should I send update to server immediately or wait for some save button or something?
    }

    return <div style={{position: "relative", display: "flex", flexDirection: "column", }}>
        {/* <div>
            Design decisions for this component
            <ol>
                <li>Always visible handles<br />
                    + can drag from any state<br />
                    - handles can sit on top of eachother making it impossible to grab the right one
                </li>
                <li>
                    Selection behavior<br />
                    + Provides context for editing locations, adding points to existing shapes, adding points to locations that don&apos;t have one at all yet<br />
                    - Slows down the flow, forces an additional click before dragging what&apos;s visible
                </li>
                <li>
                    &quot;Mode&quot; or &quot;Visible modifier&quot;<br />
                    I&apos;m sure there are better names for these options but I do not know them, I like UX but am not an expert<br />
                    + Modes provide a less cluttered interface<br/>
                    ) no unasked for drag handles<br />
                    ) known indicator implying current behavior<br />

                    + Visible Modifiers provide more functionality all up front with (hopefully) well designed icons<br />
                    ) Probably best combined with at least Selection behavior to avoid cluttering every shape<br/>
                    ) aside from side insertion ghost nodes, until I decide I need arc nodes or something there really aren&apos;t that any options to display
                </li>
            </ol>
        </div> */}
        <div style={{maxWidth:'50vw', maxHeight: '50vw', position: 'relative'}}>
            {/* this canvas shows only direct sublocation polygons, maybe editable here */}
            {/*!loading && <Canvas draw={canvasDraw} style={{backgroundColor:'lightslategray', width: '100%'}}></Canvas>*/}
            {/* no real reason to use Canvas component for one and useCanvas for the other, just playing with each model and seeing what I can do with them */}
            {/*!loading && <canvas ref={canvasRef} style={{position:'absolute', left: 0, width: '100%'}} width="1000" height={1000} onMouseMove={handleCanvasMouseMove} onMouseDown={handleCanvasMouseDown} onMouseUp={handleCanvasMouseUp}></canvas>*/}
        </div>
        {shapes && <ShapeCanvas
            style={{alignSelf: 'center', aspectRatio: 2/1, backgroundColor: '#222', maxWidth: '100%', maxHeight: '50rem'}}
            shapes={shapes}
            shapeChangeCB={handleShapeUpdate}
            selectedIndex={sublocindex}
            setSelectedIndex={setSublocindex}
            width="2000"
            height="1000"
        ></ShapeCanvas>}

        {shapes && <div style={{
            display: 'flex',
            // alignItems: 'flex-start'
            justifyContent: 'center',
            }}>
            <ShapeSVG
                style={{
                    aspectRatio: 2/1,
                    maxWidth: '100rem',
                    flexGrow: 1,
                }}
                shapes={shapes}
                onSave={handleShapeUpdate}
                selectedIndex={sublocindex}
                setSelectedIndex={setSublocindex}
                width="2000"
                height="1000"
            ></ShapeSVG>
            <aside>
                left - custom picker
                {locationData?.sub.map((loc, loci) => 
                    <div 
                        key={loci}
                        style={{
                            backgroundColor: (loci === sublocindex ? 'red' : 'inherit'),
                        }}
                        onClick={() => setSublocindex(loci)}
                    >
                        <nota-color-picker
                            value={`#${loc.rgb?.toString(16).padStart(6,'0') ?? 'FFF'}`}
                            onChange={(e) => {handleShapeUpdate({...shapes[loci], color: e.currentTarget.value}, loci)}}
                            onClick={event => event.stopPropagation()}
                        ></nota-color-picker>
                        <input
                            type="color"
                            defaultValue={`#${loc.rgb?.toString(16).padStart(6,'0') ?? 'FFF'}`}
                            onChange={(e) => {handleShapeUpdate({...shapes[loci], color: e.currentTarget.value}, loci)}}
                            style={{verticalAlign: 'center'}}
                        />
                        {loc.name_short}
                    </div>
                )}
                these update a sub state for the canvases so the pickers aren&apos;t synced together currently, that is the plan eventually until I decide which picker I'm using, native is well... native, but consistent UX is a good thing, this is just another unfortunate step along my unplanned development as things get fixed as they get discovered. the custom picker is very early stage and can definitely be improved, but firefox on kde picker is really low functionality
            </aside>
        </div>}

        <p>
            Showing sub locations seems reasonable, I&apos;ve started drawing handles on the canvas for each point.
            I intend to process these objects in such a way that they not only draw the shapes within the canvas,
            but can be created/manipulated as well, some sort of canvas callback once the data is updated to save
            those changes back to their respective locations... that UI will certainly be a bit more complex to
            figure out, probably not my next major task, at least until I get most of the more critical functionality done
        </p>

        <div>Location Items - should this just be a list or a modal? loaded immediately or only upon request? more UX decisions</div>

        <p>This should allow you to configure this location, move it, sell everything in it, add it to incident report, etc.</p>

        {!loading && <>
            <Image src="http://placebeard.it/400/400" width={400} height={400} alt="Primary image of current item" style={{alignSelf: "center"}}/>
            {error && <div>This location does not seem to exist, or some other error: {error.stack} {error.message}</div>}
            <label>
                Location Path:&nbsp;
                <output style={{color: `#${locationData?.rgb?.toString(16).padStart(6,'0') ?? 'F00'}`}}>{locationData?.name}</output>
            </label>
            <label>
                Last Modified:&nbsp; 
                <time dateTime={locationData?.last_modified}>{locationData?.last_modified}</time>
            </label>
            <label>
                Short Desc:&nbsp;
                <output>{locationData?.description}</output>
            </label>
            <label>Notes:&nbsp;<output>{locationData?.notes}</output></label>
            {/* a table is possibly overkill here, not sure if there are other fields to display on sub locations yet... */}
            <table>
                <thead>
                    <tr>
                        <th>Sub Location</th>
                    </tr>
                </thead>
                <tbody>
                    {locationData && locationData.sub.map(sl => <tr key={sl.name}>
                        <td style={{color: `#${sl.rgb?.toString(16).padStart(6,'0')}`}}><Link href={`/location/${sl.name}`}>{sl.name}</Link></td>
                    </tr>)}
                    {/* make this sortable by date added as sub-location as well as alpha and maybe sub-location creation date? if it was moved here for example */}
                    <tr><th>Sibling Locations</th></tr>

                    {locationData && locationData.sib.map(sl => <tr key={sl.name}>
                        <td style={{color: `#${sl.rgb?.toString(16).padStart(6,'0')}`}}><Link href={`/location/${sl.name}`}>{sl.name}</Link></td>
                    </tr>)}
                </tbody>
                <tfoot><tr><th><button>Add sub location</button></th></tr></tfoot>
            </table>
        </>}
    </div>
}