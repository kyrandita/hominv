'use client'

import Canvas from "@/Components/Canvas";
import { LocationReturn } from "@/Utils/fakeData.js";
import { tupleize } from "@/Utils/functions";
import { useCanvas } from "@/Utils/useCanvas";
import { useFetch } from "@/Utils/useFetch";
import Image from "next/image"
import Link from "next/link";
import { MouseEventHandler, useCallback, useEffect, useState } from "react";

type SubLocShape = {
    stroke: CanvasFillStrokeStyles['strokeStyle'] ,
    fill: CanvasFillStrokeStyles['fillStyle'],
    path: Path2D,
    handles: [number, number][]
}

export default function LocationPage({params} : {params: Promise<{ slug: string[] }>}) {
    const [slug, setSlug] = useState<string>()
    const {data:locationData, error, loading } = useFetch<LocationReturn>(`/api/location/${slug}`)
    const [paths, setPaths] = useState<SubLocShape[]>([])

    useEffect(() => {
        (async () => {
            const { slug } = await params;
            setSlug(slug.join('/'))
        })()
    }, [ params ])

    useEffect(() => {
        if (locationData) {(async () => { // this IIFE is just to avoid a react error, this should actually be triggered as a callback from the fetch once I figure out how I want that to look
            const [locpaths, controlPoints] = locationData.sub.reduce<[SubLocShape[], [number, number][][]]>(([paths, points], curLoc) => {
                const thisShapeHandles: [number, number][] = []
                const p = new Path2D()
                if (curLoc.quad?.length ?? 0 % 2 == 0) {
                    const polyTuples = tupleize<number>(curLoc.quad ?? [], 2) // later this should already come in this format to this function
                    p.moveTo(polyTuples[0][0], polyTuples[0][1])
                    thisShapeHandles.push([polyTuples[0][0], polyTuples[0][1]])
                    polyTuples.slice(1).forEach(pt => {
                        p.lineTo(pt[0], pt[1])
                        thisShapeHandles.push([pt[0], pt[1]])
                    })
                    p.closePath()
                    return [
                        [ 
                            ...paths,
                            {
                                stroke: 'black',
                                fill: `#${curLoc?.rgb?.toString(16).padStart(6,'0') ?? 'F00'}`,
                                path: p,
                                handles: thisShapeHandles,
                            }
                        ], [ ...points, thisShapeHandles]]
                } // else, segments are not divisible by two, not valid polygon by this method... don't currently support path attribute 'd' format instructions
                return [paths, points]
            }, [[], []])
            setPaths(locpaths)
        })()}
    }, [locationData])

    const canvasDraw = useCallback((ctx: CanvasRenderingContext2D) => {
        paths.forEach((p) => {
            ctx.lineWidth = 2
            ctx.strokeStyle = 'black'
            ctx.fillStyle = p.fill
            ctx.fill(p.path)
            // ctx.stroke(p.path)
            // p.handles.forEach(shapePoints => {
            ctx.strokeStyle = 'white'
            ctx.fillStyle = 'blue'
            ctx.lineWidth = 3
            for (let i = 0; i < p.handles.length; i++) {
                // drawing handles here will draw under later shapes, possibly draw handles after if they are to be grabbable through other shapes... priority of overlapping handles will have to be determined
                const prev = p.handles.at(i-1) ?? [0,0]
                const h = p.handles.at(i) ?? [0,0] //  this default is dumb, typescript doesn't recognize that this is impossible to reach here without a legit value?
                const next = i+1 < p.handles.length ? p.handles.at(i+1) ?? [0,0] : p.handles.at(0) ?? [0,0]
                ctx.beginPath()
                ctx.moveTo(h[0], h[1])
                // these angles can be calculated once when the locations are loaded, though I'll still have to do some of it dynamically as the handles are dragged...
                ctx.ellipse(h[0], h[1], 15, 15, 0, Math.atan2(next[1] - h[1], next[0] - h[0]), Math.atan2(prev[1] - h[1], prev[0] - h[0]))
                ctx.closePath()
                ctx.fill()
                // ctx.stroke()
            }
            // })
        })
    }, [paths])
    const { ref:canvasRef } = useCanvas({draw: canvasDraw})

    useEffect(() => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d')
            // console.log(context)
            if (context) { //realistically this canvas should never have another context set to it... but typescript is strict
                // canvasDraw(context)

            }
        }
    }, [paths, canvasRef, canvasDraw])

    const handleCanvasMouseMove: MouseEventHandler<HTMLCanvasElement> = (e: React.MouseEvent<HTMLCanvasElement>) => {
        // console.log(e)
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect()
            const canvasX = (e.clientX - rect.x)/rect.width*1000
            const canvasY = (e.clientY - rect.y)/rect.height*1000
            const context = canvasRef.current.getContext('2d')
            if (!context) return
            // context.save()
            // context.beginPath()
            // context.ellipse(canvasX, canvasY, 4, 4, 0, 0, 2*Math.PI)
            // context.closePath()
            // context.fillStyle = 'orange'
            // context.fill()
            
            // context.beginPath()
            // context.ellipse(e.pageX, e.pageY, 4, 4, 0, 0, 2*Math.PI)
            // context.closePath()
            // context.fillStyle = 'purple'
            // context.fill()
            context.clearRect(0,0,1000,1000)// not sure if clearing when nothing changes is worth optimizing out, but as a thought for later if it's performance breaking
            paths.forEach(path => {
                if (context?.isPointInPath(path.path, canvasX, canvasY)) {
                    context.fillStyle = 'orange'
                    context.fill(path.path)
                }
                // indicates it may be best to store handles as paths for detection...
                // but I have to remember which path I'm updating when dragging and update the paths
                // associated without losing that reference...
                // maybe pathID for one type of focus, mouse point for another to the rendering function?
                // I'd certainly prefer avoiding redrawing the whole canvas each movement of the mouse,
                // only trigger if the focused/hovered element changes or if they're dragging and positions
                // actually shift, otherwise not redrawing seems best

                // MDN suggested multiple layered canvases for things like this actually, I could have a handle/edit
                // layer where I draw things when dragging/hovering, leaving the lower layer to only render when I
                // put that object back in the set...

                // path.handles.forEach(phandle => {
                // })
            })
            // context.restore()
        }
    }
    return <div style={{position: "relative", display: "flex", flexDirection: "column", }}>
        <div style={{maxWidth:'50vw', maxHeight: '50vw', position: 'relative'}}>
            {/* this canvas shows only direct sublocation polygons, maybe editable here */}
            {!loading && <Canvas draw={canvasDraw} style={{backgroundColor:'lightslategray', width: '100%'}}></Canvas>}
            {!loading && <canvas ref={canvasRef} style={{position:'absolute', left: 0, width: '100%'}} width="1000" height={1000} onMouseMove={handleCanvasMouseMove}></canvas>}
        </div>
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
        <Image src="http://placebeard.it/400/400" width={300} height={200} alt="Primary image of current item" style={{alignSelf: "center"}}/>
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
        </table></>}
    </div>
}