'use client'
import { useFetch } from "@/Utils/useFetch"
import Link from "next/link"

export default function Locations() {
    // this would likely be paginated and will be the next step in data faking as well, just doing this for v1
    const user_inventory = useFetch('/api/location/list')
    return <div>
        <p>Users home inventory, paginated likely when I get far enough to do that</p>
        <table>
            <thead>
                <tr>
                    <th>Location Name</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
            {user_inventory?.record?.map(({loc, quad, rgb}) => 
                <tr key={loc}>
                    <td><Link href={`/location/${loc}`}>{loc}</Link></td>
                    <td>{JSON.stringify(quad)}</td>
                    <td>{rgb.toString(16).toUpperCase().padStart(6, "0")}</td>
                    <td><button onClick={() => alert('remove/sell/move item sub menu')}>action menu</button></td>
                </tr>
            )}
            </tbody>
            <tfoot>
                <tr><td colSpan={4}>
                    <button onClick={() => alert('open a modal form to add new items')}>Add Item</button>
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