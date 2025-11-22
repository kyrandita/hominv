'use client'
import AddInventoryForm from "@/Components/AddInventoryForm"
import { useFetch } from "@/Utils/useFetch"
import { Dialog } from "@mui/material"
import Link from "next/link"
import { FormEvent, useState } from "react"

export default function Inventory() {
    // this would likely be paginated and will be the next step in data faking as well, just doing this for v1
    const user_inventory = useFetch('/api/inventory')
    const [addInventoryOpen, setAddInventoryOpen] = useState<boolean>(false)

    function handleAddFormSubmit(fd:FormEvent) {
        // not the React way of doing things I know, I should make the form use a bunch of states and collect the form data that way, using this callback at the end without using th enative FormEvent... I may go that direction eventually to be more React conformant, this was just what came to mind first right now

        fd.preventDefault()
        // possibly show loading indicator
        console.log(fd.target)
        const formData = new FormData(fd.target as HTMLFormElement)
        // send form data to API await response
        // if success clear and close modal form
        // else notify what went wrong
        // remove loading indicator
        console.log(fd, formData)
    }

    return <div>
        <p>Users home inventory, paginated likely when I get far enough to do that</p>
        <table>
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
            {Array.isArray(user_inventory?.record) && user_inventory?.record?.map(({id, name, qty, location}) => 
                <tr key={name}>
                    <td><Link href={`/item/${id}`}>{name}</Link></td>
                    <td>{qty}</td>
                    <td><Link href={`/location/${name}`}>{location}</Link></td>
                    <td><button onClick={() => alert('remove/sell/move item sub menu')}>action menu</button></td>
                </tr>
            )}
            </tbody>
            <tfoot>
                <tr><td colSpan={4}>
                    <button onClick={() => setAddInventoryOpen(true)}>Add Item</button>
                    <Dialog
                        open={addInventoryOpen}
                        onClose={() => setAddInventoryOpen(false)}>
                            <AddInventoryForm OnSubmit={handleAddFormSubmit}></AddInventoryForm>
                    </Dialog>
                </td></tr>
            </tfoot>
        </table>

            <p>possibly as another column/page but a way to manage locations, I want locations to be creatable when adding an item. No need to back out to create a new file box location if you can just imply it's existence by a new location path (according to the path adjacency model of heirarchy). The point is to get in your way as little as possible while keeping track of your stuff.</p>
            <hr/>

        <footer>
            <button>Export CSV for insurance claim</button>{/* including by default additional information like current valuation, purchase price, purchase date... all that stuff insurance companies want in case of a claim */}
            <button>export DB backup</button>{/* since this app is intended to be self-hosted, this function should actually be automatable to an offsite DB in case the very server it's hosted on is part of the loss claim */}
            <button>Print hard copy</button>{/* in case you want paper records */}
            {/* all of these should be filterable to selected locations/items and selected fields, smart defaults if possible and maybe configurable reports, more things TODO in the DB */}
        </footer>
    </div>
}