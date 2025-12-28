'use client'
import AddLocationForm from "@/Components/AddLocationForm"
import LocationRow from "@/Components/LocationRow"
import { Location } from "@/Utils/fakeData"
import fetch from "@/Utils/fakeFetch"
import { usePagedFetch } from "@/Utils/usePagedFetch"
import { MouseEvent, useEffect, useRef, useState } from "react"

export default function Locations() {
    const [locationURL, setLocationURL] = useState<URL>(new URL('/api/location/list?pagesize=10', globalThis.location?.origin ?? 'http://localhost'))
    const {data: locations, loading, error, refresh, pageCur, pageTotal, pagefuncs: { toPage, firstPage, prevPage, nextPage, lastPage } } = usePagedFetch<Location>(locationURL)

    // TODO switch this to useDialog
    const [addLocModalOpen, setAddLocModalOpen] = useState(false)
    const addLocRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        if (addLocModalOpen) addLocRef?.current?.showModal()
        if (!addLocModalOpen && addLocRef?.current?.open) addLocRef.current.close()
    }, [addLocModalOpen])

    function handleAddLocCloseEvent() {
        setAddLocModalOpen(false)
    }

    async function handleNewLocation(fd: FormData) {
        const fr = await fetch('/api/location', { method: 'post', body: fd })
        if (fr.ok) {
            refresh(true)
            setAddLocModalOpen(false)
        }
        return fr.ok
    }

    const handleFirstPageClick = () => setLocationURL(firstPage())
    const handlePrevPageClick = () => setLocationURL(prevPage())
    const handleNextPageClick = () => setLocationURL(nextPage())
    const handleLastPageClick = () => setLocationURL(lastPage())
    const handleNumericPageClick = (e: MouseEvent<HTMLButtonElement>) => {
        setLocationURL(toPage(Number(e.currentTarget.dataset.pagenum ?? 1)))
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
            {!loading && locations && locations?.records.map((location, ind) => 
                <LocationRow key={location.name} location={location}></LocationRow>
            )}
            </tbody>
            <tfoot>
                <tr>{locations && 
                    <td colSpan={5} style={{textAlign: 'center'}}>
                        <button onClick={handleFirstPageClick}>First Page</button>
                        <button onClick={handlePrevPageClick}>Prev Page</button>
                        showing record(s) {(locations.offset) + 1} - {Math.min((locations?.offset) + Number(locations?.pagesize), (locations?.total))} out of {locations?.total}
                        <button onClick={handleNextPageClick}>Next Page</button>
                        <button onClick={handleLastPageClick}>Last Page</button>
                    </td>}
                </tr>
                <tr>
                    {locations && <td colSpan={5} style={{textAlign: 'center'}}>
                        {pageCur > 3 && <button onClick={handleFirstPageClick}>1</button>}
                        {pageCur > 4 && <span>…</span>}
                        {[...Array(Math.min(pageTotal, 5)).keys()].map(i => {
                            // this is recalculating on each iteration, not a good solution, just how I threw it together first
                            // TODO I'll probably refactor this soon
                            const siblings = 2
                            const offset = Math.max(1 - pageCur, -siblings) + pageCur + (pageTotal > siblings*2 ? Math.min(pageTotal - siblings - pageCur, 0) : 0)
                            return <button
                                key={`pageindicator${String(i + offset).padStart(3,'0')}`}
                                style={{color: i+offset == pageCur ? 'blue': 'red'}}
                                onClick={handleNumericPageClick}
                                data-pagenum={i+offset}
                                >
                                    {i + offset}
                                </button>
                        })}
                        {pageCur < pageTotal - 3 && <span>…</span>}
                        {pageCur < pageTotal - 2 && <button onClick={handleLastPageClick}>{pageTotal}</button>}
                    </td>}
                </tr>
                <tr><td colSpan={4}>
                    <button onClick={() => setAddLocModalOpen(true)}>Add Location</button>
                </td></tr>
            </tfoot>
        </table>
        <dialog ref={addLocRef} onClose={handleAddLocCloseEvent}>
            {addLocModalOpen && <AddLocationForm OnSubmit={handleNewLocation}></AddLocationForm>}
        </dialog>
    </div>
}