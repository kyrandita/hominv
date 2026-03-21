/**
 * This is a simple attempt at defining unique paths for every key in a complex but not circularly
 * referential object containing various types and values. While it is called toJSONPath I do not
 * think it will ever be truly compatible for every scenario, only the ones I use in this application
 * and there are bound to be better implementations of something similar for other use cases.
 * 
 * In reality this is highly experimental and I'm not even sure I'm gonna use it here, but it was a
 * fun idea and it got me to set up the Unit testing so I can start adding tests for parts that are
 * more complete
 * 
 * @param o the variable to be converted into a key map
 * @returns 
 */
export function toJSONPath(o: unknown) {
    return PathRecurse(o)
}

function PathRecurse(o: unknown, prefix:string = ''): Map<string, unknown> {
    const paths: Map<string, unknown> = new Map()
    
    if (typeof o === 'object' && o !== null) {
        // classic Array type, need additional handling for Array-likes that need to be similarly processed, for things like Set could be as simple as converting to Array
        if (Array.isArray(o)) {
            o.forEach((val, ind) => {
                const result = PathRecurse(val, `[${ind}]`)
                result.forEach((v,k) => {
                    paths.set(`${prefix.length ? prefix : '.'}${k}`, v)
                })
            })
            // I don't currently have indexed keys
        } else {
            Object.entries(o).forEach(([key, value]) => {
                const result = PathRecurse(value, `${key}`)
                result.forEach((v,k) => {
                    paths.set(`${prefix}.${k}`, v)
                })
            })
        }
    } else {
        // there are likely types that will get here we don't want to, but the primative case is that all non-objects are set to their key prefix
        paths.set(prefix.length ? prefix : '.', o)
    }

    return paths
}