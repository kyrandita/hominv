'use client'

import Canvas from "@/Components/Canvas";
import { LocationReturn } from "@/Utils/fakeData";
import { tupleize } from "@/Utils/functions";
import { useFetch } from "@/Utils/useFetch";
import Image from "next/image"
import Link from "next/link";
import { relative } from "path";
import { useEffect, useState } from "react";

export default function LocationPage({params} : {params: Promise<{ slug: string[] }>}) {
    const [slug, setSlug] = useState<string>()
    const {data:locationData, loading, error} = useFetch<LocationReturn>(`/api/location/${slug}`)
    useEffect(() => {
        (async () => {
            const { slug } = await params;
            // console.log('SLUG', slug)
            setSlug(slug.join('/'))
        })()
    }, [ params ])

    const canvasDraw = (ctx: CanvasRenderingContext2D) => {
        if (locationData) {
            locationData.sub.forEach(loc => {
                if (!loc.quad?.length) return
                ctx.beginPath()
                const polyTuples = tupleize<number>(loc.quad ?? [], 2) // later this should already come in this format to this function
                ctx.moveTo(polyTuples[0][0], polyTuples[0][1])
                polyTuples.slice(1).forEach(pt => ctx.lineTo(pt[0], pt[1]))
                ctx.closePath()
                // ctx.strokeStyle = `#${loc?.rgb?.toString(16).padStart(6,'0') ?? 'F00'}`
                ctx.fillStyle = `#${loc?.rgb?.toString(16).padStart(6,'0') ?? 'F00'}`
                // console.log(loc.rgb, loc?.rgb?.toString(16).padStart(6,'0'), ctx)
                ctx.fill()
                ctx.stroke()
            })
        }
        // use locationdata to draw either current location sublocations, sibling locations and current, or maybe both?
    }
    return <div style={{position: "relative", display: "flex", flexDirection: "column", }}>
        <div style={{maxWidth:'50vw', maxHeight: '50vw', position: 'relative'}}>
            {/* this canvas shows only direct sublocation polygons, maybe editable here */}
            {!loading && <Canvas draw={canvasDraw} style={{backgroundColor:'lightslategray', width: '100%'}}></Canvas>}
        </div>
        <p>should I draw where this location is in it&apos;s parent as well or just it&apos;s sub-locations?</p>

        <div style={{position:"absolute", top:0, right: 0}}><button>Location Items</button></div>
        <p>This should allow you to configure this location, move it, sell everything in it, add it to incident report, etc.</p>
        {!loading && <><p>Recognized slug {slug} with data {JSON.stringify(locationData)}</p>
        <Image src="http://placebeard.it/400/400" width={300} height={200} alt="Primary image of current item" style={{alignSelf: "center"}}/>
        <label>
            Location Path:
            <output>Home(555 nowhere ave)/Garage/ClosetA</output>
        </label>
        <label>
            Short Desc:
            <output>Storage Closet</output>
        </label>
        <label>Notes:<output>Closet A is primarily storage for old toys, not suitable for electronics, being in the garage it is not sealed to moisture and tech/electronic media will be damage over time if not properly insulated</output></label>
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