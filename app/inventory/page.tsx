'use client'
import AddInventoryForm from "@/Components/AddInventoryForm"
import fetch from "@/Utils/fakeFetch"
import { Dialog } from "@mui/material"
import Link from "next/link"
import { useState } from "react"
import { Item } from "@/Utils/fakeData.js"
import { usePagedFetch } from "@/Utils/usePagedFetch"

import './page.css'
import { useFetch } from "@/Utils/useFetch"

export default function Inventory() {
    // this would likely be paginated and will be the next step in data faking as well, just doing this for v1
    const [pageUrl, setPageUrl] = useState(new URL('/api/inventory', globalThis.location?.origin ?? 'http://localhost'))
    // TODO switch to usePagedFetch since I went to the effort to make it
    // const {data:user_inventory, loading, error, refresh:inventoryRefresh } = useFetch<{records:Item[], offset: number, pagesize: number, total: number}>(pageUrl)
    const {data:user_inventory, loading, error, refresh:inventoryRefresh, pagefuncs:{changePage, firstPage, lastPage}} = usePagedFetch<Item>(pageUrl)
    const {data: catData, loading: catLoading, error: catError} = useFetch<Array<string>>('/api/category')
    const [addInventoryOpen, setAddInventoryOpen] = useState<boolean>(false)

    function handleAddFormSubmit(fd:FormData) {
        // possibly show loading indicator
        // send form data to API await response
        const fr = fetch('/api/inventory', { method: 'post', body: fd })
        fr.then((res) => {
            if (!res.ok) {
                // tell user why it failed, right now this is always it doesn't work yet
                alert(res.statusText)
            } else {
                // if success clear and close modal form
                setAddInventoryOpen(false)
                inventoryRefresh(false)
                // remove loading indicator
            }
        })
    }

    // const changePage = (pageChange: number): void => {
    //     // const nurl = new URL(pageUrl)
    //     // maybe clear other params, but if working as designed no other params should exist
    //     // nurl.searchParams.set('pagesize', String(user_inventory?.pagesize))
    //     // nurl.searchParams.set('offset',String((user_inventory?.offset ?? 0) + ((user_inventory?.pagesize ?? 0) * pageChange)))
    //     // if (user_inventory && Number(nurl.searchParams.get('offset')) >= (user_inventory?.total) || Number(nurl.searchParams.get('offset')) < 0) return
    //     // setPageUrl(nurl)
    // }

    const handleFirstPage = () => {
        // const nurl = new URL(pageUrl)
        // nurl.searchParams.set('pagesize', String(user_inventory?.pagesize))
        // nurl.searchParams.set('offset', String(0))
        setPageUrl(firstPage())
    }
    const handleNextPage = () => setPageUrl(changePage(1))
    const handlePrevPage = () => setPageUrl(changePage(-1))
    const handleLastPage = () => {
        // if (user_inventory) {
        //     const nurl = new URL(pageUrl)
        //     nurl.searchParams.set('pagesize', String(user_inventory?.pagesize))
        //     nurl.searchParams.set('offset', String(Math.floor(user_inventory?.total/user_inventory?.pagesize)*user_inventory?.pagesize))
        //     setPageUrl(nurl)
        // }
        setPageUrl(lastPage())
    }

    return <main className="inventory">
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Description</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                {user_inventory && Array.isArray(user_inventory.records) && user_inventory.records.map(({id, name, categories, qty, description, location}) => 
                    <tr key={name}>
                        <td><Link href={`/item/${id}`}>{name}</Link></td>
                        <td>{qty}</td>
                        <td>{categories.join(', ')}</td>
                        <td><Link href={`/location/${name}`}>{location}</Link></td>
                        <td>{description}</td>
                        <td><button style={{fontSize: '1.5em', borderStyle: 'none', padding: '0 1em'}} onClick={() => alert('remove/sell/move item sub menu')}>≡</button></td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
        <div>
            {user_inventory && <>
                <button onClick={handleFirstPage}>First Page</button>
                <button onClick={handlePrevPage}>Prev Page</button>
                showing record(s) {(user_inventory?.offset) + 1} - {Math.min((user_inventory?.offset) + Number(user_inventory?.pagesize), (user_inventory?.total))} out of {user_inventory?.total}
                <button onClick={handleNextPage}>Next Page</button>
                <button onClick={handleLastPage}>Last Page</button>
            </>}
        </div>
        <div>
            <button onClick={() => setAddInventoryOpen(true)}>+ Add Item</button>
            <Dialog
                // this uses mui Dialog instead of my useDialog to show using external component libraries, not sure how necessary this is
                open={addInventoryOpen}
                onClose={() => setAddInventoryOpen(false)}>
                    {/* && here is correct because I know the left hand is a boolean, otherwise I'd need to !! or Boolean() cast it to avoid render condition leaking */}
                    {addInventoryOpen && <AddInventoryForm OnSubmit={handleAddFormSubmit}></AddInventoryForm>}
            </Dialog>
        </div>
        <p>possibly as another column/page but a way to manage locations, I want locations to be creatable when adding an item. No need to back out to create a new file box location if you can just imply it&apos;s existence by a new location path (according to the path adjacency model of heirarchy). The point is to get in your way as little as possible while keeping track of your stuff.</p>
        <footer>
            <button>Export CSV for insurance claim</button>{/* including by default additional information like current valuation, purchase price, purchase date... all that stuff insurance companies want in case of a claim */}
            <button>export DB backup</button>{/* since this app is intended to be self-hosted, this function should actually be automatable to an offsite DB in case the very server it's hosted on is part of the loss claim */}
            <button>Print hard copy</button>{/* in case you want paper records */}
            <div>some  {catData && catData.toString()} words</div>
            {/* all of these should be filterable to selected locations/items and selected fields, smart defaults if possible and maybe configurable reports, more things TODO in the DB */}
        </footer>
    </main>
}