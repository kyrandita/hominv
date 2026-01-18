'use client'

import Canvas from "@/Components/Canvas";
import { LocationReturn } from "@/Utils/fakeData.js";
import { tupleize } from "@/Utils/functions";
import { useFetch } from "@/Utils/useFetch";
import Image from "next/image"
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LocationPage({params} : {params: Promise<{ slug: string[] }>}) {
    const [slug, setSlug] = useState<string>()
    const {data:locationData, error, loading } = useFetch<LocationReturn>(`/api/location/${slug}`)
    const [paths, setPaths] = useState<{stroke: CanvasFillStrokeStyles['strokeStyle'] , fill: CanvasFillStrokeStyles['fillStyle'], path: Path2D}[]>([])
    const [handles, setHandles] = useState<[number, number][][]>([])
    useEffect(() => {
        (async () => {
            const { slug } = await params;
            setSlug(slug.join('/'))
        })()
    }, [ params ])

    useEffect(() => {
        if (locationData) {(async () => { // this IIFE is just to avoid a react error, this should actually be triggered as a callback from the fetch once I figure out how I want that to look
            const points : [number, number][][] = []
            setPaths(locationData.sub.map((loc) => {
                const thisShapeHandles: [number, number][] = []
                const p = new Path2D()
                if (loc.quad?.length ?? 0 % 2 == 0) {
                    const polyTuples = tupleize<number>(loc.quad ?? [], 2) // later this should already come in this format to this function
                    p.moveTo(polyTuples[0][0], polyTuples[0][1])
                    thisShapeHandles.push([polyTuples[0][0], polyTuples[0][1]])
                    polyTuples.slice(1).forEach(pt => {
                        p.lineTo(pt[0], pt[1])
                        thisShapeHandles.push([pt[0], pt[1]])
                    })
                    p.closePath()
                }
                points.push(thisShapeHandles)
                return {
                    stroke: 'black',
                    fill: `#${loc?.rgb?.toString(16).padStart(6,'0') ?? 'F00'}`,
                    path: p,
                }
            }))
            setHandles(points)
        })()}
    }, [locationData])

    const canvasDraw = (ctx: CanvasRenderingContext2D) => {
        ctx.lineWidth = 2
        ctx.strokeStyle = 'black'
        paths.forEach((p) => {
            ctx.fillStyle = p.fill
            ctx.fill(p.path)
            ctx.stroke(p.path)
        })
        // use locationdata to draw either current location sublocations, sibling locations and current, or maybe both?
        ctx.strokeStyle = 'white'
        ctx.fillStyle = 'blue'
        ctx.lineWidth = 3
        handles.forEach(shapePoints => {
            for (let i = 0; i < shapePoints.length; i++) {
                const prev = shapePoints.at(i-1) ?? [0,0]
                const h = shapePoints.at(i) ?? [0,0] //  this default is dumb, typescript doesn't recognize that this is impossible to reach here without a legit value?
                const next = i+1 < shapePoints.length ? shapePoints.at(i+1) ?? [0,0] : shapePoints.at(0) ?? [0,0]
                ctx.beginPath()
                ctx.moveTo(h[0], h[1])
                // these angles can be calculated once when the locations are loaded, though I'll still have to do some of it dynamically as the handles are dragged...
                ctx.ellipse(h[0], h[1], 15, 15, 0, Math.atan2(next[1] - h[1], next[0] - h[0]), Math.atan2(prev[1] - h[1], prev[0] - h[0]))
                ctx.closePath()
                ctx.fill()
                ctx.stroke()
            }
        })
    }
    return <div style={{position: "relative", display: "flex", flexDirection: "column", }}>
        <div style={{maxWidth:'50vw', maxHeight: '50vw', position: 'relative'}}>
            {/* this canvas shows only direct sublocation polygons, maybe editable here */}
            {!loading && <Canvas draw={canvasDraw} style={{backgroundColor:'lightslategray', width: '100%'}}></Canvas>}
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