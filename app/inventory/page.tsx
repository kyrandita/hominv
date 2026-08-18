'use client'
import AddInventoryForm from "@/Components/AddInventoryForm"
import fetch from "@/Utils/fakeFetch"
import { Chip, Dialog, MenuItem, Select } from "@mui/material"
import Link from "next/link"
import { ChangeEvent, SyntheticEvent, useState } from "react"
import { Item } from "@/Utils/fakeData.js"
import { usePagedFetch } from "@/Utils/usePagedFetch"

import './page.css'
import { useFetch } from "@/Utils/useFetch"

export default function Inventory() {
    const [pageUrl, setPageUrl] = useState(new URL('/api/inventory', globalThis.location?.origin ?? 'http://localhost'))
    // TODO switch to usePagedFetch since I went to the effort to make it
    // const {data:user_inventory, loading, error, refresh:inventoryRefresh } = useFetch<{records:Item[], offset: number, pagesize: number, total: number}>(pageUrl)
    const {data: user_inventory, loading, error, refresh: inventoryRefresh, pagefuncs: {changePage, firstPage, lastPage}} = usePagedFetch<Item>(pageUrl)
    const {data: catData, loading: catLoading, error: catError} = useFetch<Array<string>>('/api/category')
    const [addInventoryOpen, setAddInventoryOpen] = useState<boolean>(false)

    const [catFilterSelection, setCatFilterSelection] = useState<Set<string>>(new Set())

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

    const handleFirstPage = () => setPageUrl(firstPage())
    const handleNextPage = () => setPageUrl(changePage(1))
    const handlePrevPage = () => setPageUrl(changePage(-1))
    const handleLastPage = () => setPageUrl(lastPage())

    const handleCategoryFilterAdd = (e: ChangeEvent<Omit<HTMLInputElement, "value"> & { value: ""; }, Element> | (Event & { target: { value: ""; name: string; }; })) => {
        const categoryToAdd = e.target.value
        const newCategoryList = new Set([...catFilterSelection, categoryToAdd])
        
        // only bother making a change if the filter list actually changed, shouldn't be possible given the interface but it's a simple check
        if (newCategoryList.symmetricDifference(catFilterSelection).size) {
            setCatFilterSelection(newCategoryList)
            // forcing first page when filter changes...
            const nurl = firstPage()
            nurl.searchParams.delete('filter')
            newCategoryList.forEach(v => nurl.searchParams.append('filter', v))
            setPageUrl(nurl)
        }
    }

    const handleCategoryFilterDelete = (e: SyntheticEvent<HTMLElement, PointerEvent>) => {
        const categoryToRemove = e.currentTarget.parentElement?.dataset.category
        const newCategoryList = new Set([...catFilterSelection?.values().filter(a => a != categoryToRemove)])
        if (newCategoryList.symmetricDifference(catFilterSelection).size) {
            setCatFilterSelection(newCategoryList)
            const nurl = firstPage()
            nurl.searchParams.delete('filter')
            newCategoryList.forEach(v => nurl.searchParams.append('filter', v))
            setPageUrl(nurl)
        }
    }

    const handleActionMenu = () => {
        document.dispatchEvent(new CustomEvent('notaToast', { detail: {
            message: 'open a context menu for the inventory Item',
        }}))
    }

    /*
     * since the filtered categories are stored in the URL searchParams, I might be able to ditch the state
     * storing them. I may have to test that possibility
     */

    return <main className="inventory">
        <div>
            {catFilterSelection && [...catFilterSelection.values()].map((category: string, i) =>
            // this might be a duplicate state where I could just use the URL 'filter' params
                <Chip key={i}
                    data-category={category}
                    label={category}
                    onDelete={handleCategoryFilterDelete}
                    deleteIcon={<svg height='1.5em' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'><path d='M4.795 3.912l-.883.883.147.146L7.117 8 4.06 11.059l-.147.146.883.883.146-.147L8 8.883l3.059 3.058.146.147.883-.883-.147-.146L8.883 8l3.058-3.059.147-.146-.883-.883-.146.147L8 7.117 4.941 4.06z' style={{'isolation':'auto','mixBlendMode':'normal'}} fill='currentColor' fillRule='evenodd' /></svg>}
                />)
            }
            <Select
                value = ''
                displayEmpty={true}
                renderValue={() => '+ filter'}
                IconComponent={'a'}
                onChange={handleCategoryFilterAdd}
            >
                {catData && catData.filter(a => !catFilterSelection?.has(a))
                    // TODO filter to only used ones maybe? from the current filter even. pagination probably means i'll need to include that as meta info from the api
                    .map((cat) => <MenuItem key={cat} data-category={cat} value={cat}>{cat}</MenuItem>)
                }
            </Select>
            <br />
            {/* 
                since categories can be created by the user, an interface such as this will likely
                take too much screen space, an interface such as chips in an area with the ability
                to add through a dropdown or something might be better, abandon this UI path
            */}

            {/* add Chip for selected category filters, and use a Select to add new selections? */}

            sort and filteriing options can go here, once collected I&apos;ll need to update the api to include this functionality.
        </div>
        <div className="table-wrapper">
            <table>
                <colgroup>
                    <col />
                    <col style={{width: '0px'}} />
                </colgroup>
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
                        <td><button style={{fontSize: '1.5em', borderStyle: 'none', padding: '0 1em'}} onClick={handleActionMenu}>≡</button></td>
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
            {/* all of these should be filterable to selected locations/items and selected fields, smart defaults if possible and maybe configurable reports, more things TODO in the DB */}
        </footer>
    </main>
}