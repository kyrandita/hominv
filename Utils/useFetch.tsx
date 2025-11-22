'use client'
import { useCallback, useEffect, useState } from "react";
import fetch from "./fakeFetch";

export const useFetch = <T,>(url: string): { data?: T, loading: boolean, error: Error|null, refresh: (silent:boolean) => void } => {
    const [data, setData] = useState<T | undefined>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // because I have no actual backend yet, I'm faking the data return of useFetch(),
    // when the API exists this should be a straight up drop in replacement
    // though that should be done sooner rather than later if the data lifecycle is to be tested correctly
    const refresh = useCallback(async (silent:boolean = false) => {
        setLoading(!silent)
        try {
            const response = await fetch(url, {method: 'GET'})
            if (!response.ok) {
                throw new Error('Request Error: ' + response.statusText)
            }
            setData((await response.json()).data)
        } catch (e) {
            setError(e)
        } finally {
            setLoading(false)
        }
    }, [url])

    useEffect(() => {
        refresh()
    }, [url, refresh])

    return { data, loading, error, refresh }
};