'use client'
import { useEffect, useState } from "react";
import { apiMap } from "./fakeData";

export const useFetch = (url: string): { status: number, record?: object | Array<object> } => {
    const [data, setData] = useState<{ status: number, record?: object | Array<object> }>({status: 404})

    // because I have no actual backend yet, I'm faking the data return of useFetch(),
    // when the API exists this should be a straight up drop in replacement
    // though that should be done sooner rather than later if the data lifecycle is to be tested correctly
    useEffect(() => {
        const doTheThing = async () => {
            setData(() => {
                // everything is GET right now, but the keys will have to become objects instead of just REGEX so I can define method as well
                const found = apiMap.entries().find(([regex, ]) => regex.test(url))
                console.log(url, found)
                if (!found) return { status: 404 }
                const result = url.match(found[0])
                return found[1](result?.groups)
            })
        }
        doTheThing()
    }, [url])

    return data
};