'use client'

import { Item } from "@/Utils/fakeData"
import { useFetch } from "@/Utils/useFetch"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function ItemPage({ params }: { params: Promise<{ slug: number}>}) {
    const [itemId, setItemId] = useState<number>()
    const {data:itemData, loading, error} = useFetch<Item>(`/api/inventory/${itemId}`)
    useEffect(() => {
        (async () => {
            const { slug } = await params;
            setItemId(slug)
        })()
    }, [ params ])
    return <div style={{display: "flex", flexDirection: "column", }}>
        <Image src="http://placebeard.it/200/300" width={300} height={200} alt="Primary image of current item" />
        <label>
            Short Desc:
            <output>Fony Bravii Smart TV</output>
        </label>
        <div><span>Location:&nbsp;</span>{itemData?.location}</div>
        <div><span>Categories:&nbsp;</span>{itemData?.categories.join(', ')}</div>
        <label>
            Quantity:
            <output>{itemData?.qty}</output>
        </label>
        <label>Purchase Date:<input type="date" value="2010-06-11" disabled></input></label>
        <label>Notes:<output>{itemData && itemData.description}</output></label>
        <p>{JSON.stringify(itemData)}</p>
        <p>Item details go here, a description in addition to the specific details and fields for inventory, serial number, model number, etc... probably the edit/create form as well when introducing new inventory</p>
    </div>
}