import { apiMap } from "./fakeData";

const realFetch = globalThis.fetch

export default async function fetch(url: RequestInfo | URL, init: RequestInit): Promise<Response> { // signature match so I can strip out the fake later hopefully
    const urlstring = url instanceof Request ? url.url : url.toString()
    const [fk, fv] = apiMap.entries().find(([{regex, methods}, ]) => methods.some(mth => mth==init.method?.toUpperCase()) && regex.test(urlstring)) ?? []
    if (!fk) return new Response(null, {status: 404}) // remove when we want to switch from explicit passthrough to implicit
    const regexGroups = urlstring.match(fk.regex)
    try {
        if (!fv) {
            return realFetch(urlstring, init)
        }

        // adding a small actual async delay to this process to make sure the rest of the UI can handle what will happen in the event of an actual event loop yield
        await new Promise((res) => setTimeout(() => res(true), 400 + (Math.random() * 600)))

        // treat faked endpoints specially, converting the data that may not be behind a promise
        const result = await fv(regexGroups?.groups, init.body, urlstring)
        const { data, status, statusText } = result
    
        return new Response(
            JSON.stringify({data}), // the data key from my history with JSONAPI, I find this abstraction useful sometimes and it's become a habit, not all of JSONAPI, but always a root object makes a lot of sense to me
            {
                status,
                statusText,
            }
        )
    } catch (e) {
        console.error(e)
        return new Response(null, { status: 500, })
    }
}
