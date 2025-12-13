import { apiMap } from "./fakeData";

export default async function fetch(url: RequestInfo | URL, init: RequestInit): Promise<Response> { // signature match so I can strip out the fake later hopefully
    const urlstring = url instanceof Request ? url.url : url.toString()
    const [fk, fv] = apiMap.entries().find(([{regex, methods}, ]) => methods.some(mth => mth==init.method?.toUpperCase()) && regex.test(urlstring)) ?? []
    if (!fk || !fv) return new Response(null, {status: 404})
    const regexGroups = urlstring.match(fk.regex)
    try {
        const {data, status, statusText = ''} = fv(regexGroups?.groups, init.body, urlstring)
        return new Response(
            JSON.stringify({data}), // the data key from my history with JSONAPI, I find this abstraction useful sometimes and it's become a habit, not all of JSONAPI, but always a root object makes a lot of sense to me
            {
                status,
                statusText,
            }
        )
    } catch (e) {
        return new Response(null, { status: 500 }) //
    }
}