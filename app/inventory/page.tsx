'use client'
import { useFetch } from "@/Utils/useFetch"

export default function Inventory() {
    // this would likely be paginated and will be the next step in data faking as well, just doing this for v1
    const user_inventory = useFetch('/api/inventory/list')
    return <div>
        <table>
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th></th>
                </tr>
            </thead>
            {user_inventory?.record?.map(({name, qty, location}) => 
                <tr key={name}>
                    <td>{name}</td>
                    <td>{qty}</td>
                    <td>{location}</td>
                    <td><button onClick={() => alert('remove/sell/move item sub menu')}>action menu</button></td>
                </tr>
            )}
            <tfoot>
                <tr><th colSpan={4}>
                    <button onClick={() => alert('open a modal form to add new items')}>Add Item</button>
                </th></tr>
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