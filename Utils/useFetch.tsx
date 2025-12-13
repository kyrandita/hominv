'use client'
import { useCallback, useEffect, useState } from "react";
import fetch from "./fakeFetch";

export const useFetch = <T,>(url: RequestInfo | URL): { data?: T, loading: boolean, error: Error|null, refresh: (silent:boolean) => void } => {
    const [data, setData] = useState<T | undefined>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error|null>(null)

    // because I have no actual backend yet, I'm faking the data return of useFetch(),
    // when the API exists this should be a straight up drop in replacement
    // though that should be done sooner rather than later if the data lifecycle is to be tested correctly
    const refresh = useCallback(async (silent:boolean = false) => {
        if (url) {
            try {
                setLoading(!silent)
                const response = await fetch(url, {method: 'GET'})
                if (!response.ok) {
                    throw new Error('Request Error: ' + response.statusText)
                }
                // this strips the root object and all other meta keys from the object and only can be done here because
                // this is my version of useFetch... I probably won't do this later in the project as the additional meta keys will become useful
                // though I could provide a transform prop to format the specific instance into what the component needs...
                // not sure yet how I want to handle that
                setData((await response.json()).data)
            } catch (e) {
                setError(e)
            } finally {
                setLoading(false)
            }
        }
    }, [url])

    useEffect(() => {
        refresh()
    }, [url, refresh])

    return { data, loading, error, refresh }
};