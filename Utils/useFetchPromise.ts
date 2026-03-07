'use client'
import { useCallback, useEffect, useState } from "react";
import fetch from "./fakeFetch";

// TODO reminder to correctly enable caching on real version of useFetch, I think the built in cache of fetch will handle most things
// but it may be smart to allow a more controlled cache in some scenarios...

export type FetchReturn<T> = {
    data?: Promise<T>,
    loading: boolean,
    error: Error|null,
    refresh: (silent?:boolean) => Promise<T>
}

/* 
 * TODO may want to switch this to follow the use-http library model instead, it seems to allow greater control
 * to the component of when calls are made and Promise handling isn't relegated to useEffect watching hook output
 * data storage is also left to the component which can then filter it down or transform it as needed internally
 * 
 * though, 
 */
export const useFetch = <T,>(url: RequestInfo | URL): FetchReturn<T> => {
    const [data, setData] = useState<Promise<T> | undefined>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error|null>(null)

    // because I have no actual backend yet, I'm faking the data return of useFetch(),
    // when the API exists this should be a straight up drop in replacement
    // though that should be done sooner rather than later if the data lifecycle is to be tested correctly
    const refresh = useCallback<(silent?:boolean) => Promise<T>>(async (silent:boolean = false) => {
        setLoading(false)
        setError(null)
        console.log('hook called')
        const prom = new Promise<T>(((res, rej) => {
            (async () => {
                if (url) {
                    try {
                        setLoading(!silent)
                        const promise = fetch(url, {method: 'GET'})
                        console.log('fetch called')
                        const response = await promise
                        if (!response.ok) {
                            throw new Error('Request Error: ' + response.statusText + '::' + response.status + '%%' + url)
                        }
                        // this strips the root object and all other meta keys from the object and only can be done here because
                        // this is my version of useFetch... I probably won't do this later in the project as the additional meta keys will become useful
                        // though I could provide a transform prop to format the specific instance into what the component needs...
                        // not sure yet how I want to handle that
                        const d = (await response.json()).data
                        // setData(d)
                        setError(null)
                        res(d)
                        return d
                    } catch (e : unknown) {
                        setError(e as Error)
                    } finally {
                        setLoading(false)
                    }
                } else {
                    rej({'error': 'no url set'}) // this doesn't need to be heree with the race timeout backup, presumably the correct promise will replace this before timeout... need a mechanism to cancel old promises before replacing with new
                }
            })()
        }))
        // TODO add promise.race with some timeout logic, customizable if possible
        setData(prom)
        return prom
    }, [url])

    useEffect(() => {
        refresh()
    }, [url, refresh])

    return { data, loading, error, refresh }
}