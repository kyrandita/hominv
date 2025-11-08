'use client'
import { useEffect, useState } from "react";
import { inventory, locations } from "./fakeData";

const apiMap = new Map<RegExp, (groups?: {[key: string]: string}) => {status: number, record: any}>()
apiMap.set(/\/api\/inventory$/, () => ({ // records contain only minimal information about stored inventory
    status: 200,
    record: Object.values(inventory),
}))
apiMap.set(/^\/api\/inventory\/(?<itemId>\d*)$/, ({itemId}) => ({
    status: 200,
    record: inventory[Number(itemId)] ?? {},
}))
apiMap.set(/\/api\/location\/list/, () => ({
    status: 200,
    record: Object.entries(locations).map(([locind, loc]) => {
        return {loc: locind, ...(loc.quad ? {quad: loc.quad} : {}), rgb: loc.rgb ?? 0xFFFFFF}
    }),
}))
apiMap.set(/^\/api\/location\/(?<slug>.*)$/, ({slug}) => ({
    status: 200,
    record: Object.entries(locations).find(([locind, loc]) => locind === decodeURI(slug))?.[1] ?? {},
}))

export const useFetch = (url: string): { status: number, record?: object | Array<object> } => {
    const [data, setData] = useState<{ status: number, record?: object | Array<object> }>({status: 404})

    // because I have no actual backend yet, I'm faking the data return of useFetch(),
    // when the API exists this should be a straight up drop in replacement
    // though that should be done sooner rather than later if the data lifecycle is to be tested correctly
    useEffect(() => {
        const doTheThing = async () => {
            setData(() => {
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