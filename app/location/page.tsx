'use client'
import AddLocationForm from "@/Components/AddLocationForm"
import LocationRow from "@/Components/LocationRow"
import { Location } from "@/Utils/fakeData.js"
import fetch from "@/Utils/fakeFetch"
import { usePagedFetch } from "@/Utils/usePagedFetch"
import { MouseEvent, useEffect, useRef, useState } from "react"
import './page.css'

export default function Locations() {
    const [locationURL, setLocationURL] = useState<URL>(new URL('/api/location/list?pagesize=10', globalThis.location?.origin ?? 'http://localhost'))
    const {data: locations, loading, error, refresh, pageCur, pageTotal, pagefuncs: { toPage, firstPage, prevPage, nextPage, lastPage, changePageSize } } = usePagedFetch<Location>(locationURL)

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

    return <main className="locations">
        <p>List of Locations, not sure how useful this is yet</p>
        <div className="table-wrapper">
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
                    {(!loading || locations) && !error && locations?.records.map((location) => 
                        <LocationRow key={location.name} location={location}></LocationRow>
                    )}
                    {error && <tr><td><span>{error.message}</span></td></tr>}
                </tbody>
            </table>
        </div>
        <div>
            {locations && 
                <>
                    <button onClick={handleFirstPageClick}>First Page</button>
                    <button onClick={handlePrevPageClick}>Prev Page</button>
                    showing record(s) {(locations.offset) + 1} - {Math.min((locations?.offset) + Number(locations?.pagesize), (locations?.total))} out of {locations?.total}
                    <button onClick={handleNextPageClick}>Next Page</button>
                    <button onClick={handleLastPageClick}>Last Page</button>
                </>}
        </div>
        <div>
            {locations && <>
                {pageCur > 3 && pageTotal > 5 && <button onClick={handleFirstPageClick}>1</button>}
                {pageCur > 4 && pageTotal > 5 && <span>…</span>}
                {[...Array(Math.min(pageTotal, 5)).keys()].map(i => {
                    // this is recalculating on each iteration, not a good solution, just how I threw it together first
                    // TODO I'll probably refactor this soon
                    const siblings = 2
                    const offset = Math.max(Math.max(1 - pageCur, -siblings) + pageCur + Math.min(Math.max(pageTotal, 5) - siblings - pageCur, 0), -pageCur + 1)
                    
                    return <button
                        key={`pageindicator${String(i + offset).padStart(3,'0')}`}
                        style={{color: i+offset == pageCur ? 'blue': 'red'}}
                        onClick={handleNumericPageClick}
                        data-pagenum={i+offset}
                        >
                            {i + offset}
                        </button>
                })}
                {pageCur < pageTotal - 3 && pageTotal > 5 && <span>…</span>}
                {pageCur < pageTotal - 2 && pageTotal > 5 && <button onClick={handleLastPageClick}>{pageTotal}</button>}
            </>}
        </div>
        <div>
            <button onClick={() => setLocationURL(changePageSize(10))}>10</button>
            <button onClick={() => setLocationURL(changePageSize(25))}>25</button>
            <button onClick={() => setLocationURL(changePageSize(30, true))}>30</button>
            <button onClick={() => setLocationURL(changePageSize(50))}>50</button>
            <button onClick={() => setAddLocModalOpen(true)}>Add Location</button>
        </div>
        <dialog ref={addLocRef} onClose={handleAddLocCloseEvent}>
            {addLocModalOpen && <AddLocationForm OnSubmit={handleNewLocation}></AddLocationForm>}
        </dialog>
    </main>
}