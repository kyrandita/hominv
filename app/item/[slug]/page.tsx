'use client'

import Image from "next/image"

export default function ItemPage() {
    return <div style={{display: "flex", flexDirection: "column", }}>
        <Image src="http://placebeard.it/200/300" width={300} height={200} />
        <label>
            Short Desc:
            <output>Fony Bravii Smart TV</output>
        </label>
        <label>
            Quantity:
            <output>1</output>
        </label>
        <label>Purchase Date:<input type="date" value="2010-06-11" disabled></input></label>
        <label>Notes:<output>Mom bought me this when I left for college, Display model from a Could9 I think. RCA jacks have never worked</output></label>
        <p>Item details go here, a description in addition to the specific details and fields for inventory, serial number, model number, etc... probably the edit/create form as well when introducing new inventory</p>
    </div>
}