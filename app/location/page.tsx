'use client'
import { useFetch } from "@/Utils/useFetch"
import Link from "next/link"
import { ComponentRef, createRef, useEffect, useRef, useState } from "react"

export default function Locations() {
    // this would likely be paginated and will be the next step in data faking as well, just doing this for v1
    const user_inventory = useFetch('/api/location/list')
    // stupid trick to force render once refs are created, look into a cleaner solution eventually...
    //  yes I could just use state props for each modal but I wanted to see if this method would work cleanly... it may not
    // the linter seems to not like it much even though it's perfectly valid react...
    const [recordCount, setRecordCount] = useState(0)
    const dialogRefs = useRef<{current:HTMLDialogElement}[]>([]);

    useEffect(() => {
        console.log('effect called', user_inventory, dialogRefs.current)
        if (user_inventory.record && Array.isArray(user_inventory?.record)) {
            // trim down the extra if we've removed some and set new refs if it's grown
            dialogRefs.current = user_inventory?.record?.map((_, ind) => dialogRefs.current[ind] ?? createRef())
            // the internet seems to suggest I need this line, I want to test that later...
            dialogRefs.current = dialogRefs.current.map(i => i || createRef())
            setRecordCount(user_inventory.record.length)
        }
        console.log(dialogRefs.current)
    }, [user_inventory])

    function handleActionClick(event, ...rest) {
        console.log(dialogRefs.current, event.target)
        dialogRefs.current[event.target.dataset.index]?.current.showModal()
        // dialogRefs.current[ind]?.showModal()
    }
    return <div>
        <p>List of Locations, not sure how useful this is yet</p>
        <table>
            <thead>
                <tr>
                    <th>Location Name</th>
                    <th>Quad</th>
                    <th>RGB Color</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
            {Array.isArray(user_inventory?.record) && user_inventory?.record?.map(({loc, quad, rgb}, ind) => 
                <tr key={loc}>
                    <td><Link href={`/location/${loc}`}>{loc}</Link></td>
                    <td>{JSON.stringify(quad)}</td>
                    <td>{rgb.toString(16).toUpperCase().padStart(6, "0")}</td>
                    <td>
                        <button data-index={ind} onClick={handleActionClick}>action menu</button>
                        <dialog ref={dialogRefs.current[ind]} id={`${ind}-actions`}>
                            <p>action menu pertaining to record {loc}</p>
                            <button>remove location</button>
                        </dialog>
                    </td>
                </tr>
            )}
            </tbody>
            <tfoot>
                <tr><td colSpan={4}>
                    <button onClick={() => alert('open a modal form to add new locations')}>Add Location</button>
                </td></tr>
            </tfoot>
        </table>
    </div>
}