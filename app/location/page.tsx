'use client'
import AddLocationForm from "@/Components/AddLocationForm"
import { useFetch } from "@/Utils/useFetch"
import Link from "next/link"
import { ComponentRef, createRef, useEffect, useRef, useState } from "react"

export default function Locations() {
    // this would likely be paginated and will be the next step in data faking as well, just doing this for v1
    const {data: user_inventory, loading, error} = useFetch('/api/location/list')
    
    const [addLocModalOpen, setAddLocModalOpen] = useState(false)
    const addLocRef = useRef<HTMLDialogElement>(null)
    const dialogRefs = useRef<{current:HTMLDialogElement}[]>([])

    useEffect(() => {
        if (addLocModalOpen) addLocRef?.current?.showModal()
        if (!addLocModalOpen && addLocRef?.current?.open) addLocRef.current.close()
    }, [addLocModalOpen])

    useEffect(() => {
        console.log('effect called', user_inventory, dialogRefs.current)
        if (user_inventory && Array.isArray(user_inventory)) {
            // trim down the extra if we've removed some and set new refs if it's grown
            dialogRefs.current = user_inventory.map((_, ind) => dialogRefs.current[ind] ?? createRef())
            // the internet seems to suggest I need this line, I want to test that later...
            dialogRefs.current = dialogRefs.current.map(i => i || createRef())
        }
        console.log(dialogRefs.current)
    }, [user_inventory])

    function handleActionClick(event, ...rest) {
        console.log(dialogRefs.current, event.target)
        dialogRefs.current[event.target.dataset.index]?.current.showModal()
        // dialogRefs.current[ind]?.showModal()
    }
    function handleAddLocCloseEvent() {
        setAddLocModalOpen(false)
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
            {!loading && Array.isArray(user_inventory) && user_inventory?.map(({loc, quad, rgb}, ind) => 
                <tr key={loc}>
                    <td><Link href={`/location/${loc}`}>{loc}</Link></td>
                    <td>{JSON.stringify(quad)}</td>
                    <td>{rgb.toString(16).toUpperCase().padStart(6, "0")}</td>
                    <td>
                        <button data-index={ind} onClick={handleActionClick}>action menu</button>
                        <dialog ref={dialogRefs.current[ind]} id={`${ind}-actions`}>
                            <p>action menu pertaining to record {loc}</p>
                            <button>add sub-location</button>
                            <button>remove location</button>
                        </dialog>
                    </td>
                </tr>
            )}
            </tbody>
            <tfoot>
                <tr><td colSpan={4}>
                    <button onClick={() => setAddLocModalOpen(true)}>Add Location</button>
                </td></tr>
            </tfoot>
        </table>
        <dialog ref={addLocRef} onClose={handleAddLocCloseEvent}>
            {addLocModalOpen && <AddLocationForm></AddLocationForm>}
        </dialog>
    </div>
}