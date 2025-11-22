'use client'

import { useFetch } from "@/Utils/useFetch";
import Image from "next/image"
import { useEffect, useState } from "react";

export default function LocationPage({params} : {params: Promise<{ slug: string }>}) {
    const [slug, setSlug] = useState<string>()
    const {data:locationData} = useFetch(`/api/location/${slug}`)
    useEffect(() => {
        (async () => {
            const { slug } = await params;
            setSlug(slug)
        })()
    }, [ params ])
    return <div style={{position: "relative", display: "flex", flexDirection: "column", }}>
        <div style={{position:"absolute", top:0, right: 0}}><button>Location Items</button></div>
        <p>This should allow you to configure this location, move it, sell everything in it, add it to incident report, etc.</p>
        <p>Recognized slug {slug} with data {JSON.stringify(locationData)}</p>
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
                {/* make this sortable by date added as sub-location as well as alpha and maybe sub-location creation date? if it was moved here for example */}
                <tr><td>Box A-332</td></tr>
                <tr><td>Box A-333</td></tr>
                <tr><td>Box A-002</td></tr>
            </tbody>
            <tfoot><tr><th><button>Add sub location</button></th></tr></tfoot>
        </table>
    </div>
}