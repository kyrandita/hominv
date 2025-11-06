'use client'
import { useEffect, useState } from "react";

export const useFetch = (url: string): { status: number, record?: object | Array<object> } => {
    const [data, setData] = useState<{ status: number, record?: object | Array<object> }>({status: 404})

    // because I have no actual backend yet, I'm faking the data return of useFetch(),
    // when the API exists this should be a straight up drop in replacement
    // though that should be done sooner rather than later if the data lifecycle is to be tested correctly

    // TODO manipulate url to find matching faker function and execute with pagination or other slug params...
    useEffect(() => {
        const doTheThing = async () => {
            setData({
                '/api/inventory/list': { // records contain only minimal information about stored inventory
                    status: 200,
                    record: [
                        {name: 'TV', qty: 1, location: 'Home(555 nowhere ave)/Living Room'},
                        {name: 'Kitchenaid', qty: 1, location: 'Home(555 nowhere ave)/Kitchen/Pantry'},
                        {name: 'Bandsaw', qty: 1, location: 'Storage Unit (123 college town dr)/Pallet2'},
                    ]
                },
                '/api/location/list': {
                    status: 200,
                    record: [
                        { loc: 'Home(555 nowhere ave)', quad: [0,0,600,400], rgb: 0xCADD1E },
                        { loc: 'Home(555 nowhere ave)/Kitchen', quad: [0,0,200,100] },
                        { loc: 'Home(555 nowhere ave)/Kitchen/Pantry', quad: [150,0,200,25], rgb: 0x00FF11 },
                    ]
                },
            }[url] ?? { status: 404 })
        }
        doTheThing()
    }, [url])

    return data
};