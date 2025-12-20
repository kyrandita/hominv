export type Location = {
    name: string,
    description?: string,
    notes?: string,
    quad?: number[], // This is probably not what I need, the quad isn't on the location itself, but only on it's relation to it's parent, the location only needs a WxH, maybe a polygon
    rgb?: number,
    last_modified?: Date, // probably will be generated or gotten from the last-edited of the items within the location? not sure what makes sense yet
    // sub locations are just other locations with this path as a prefix... so not stored here as data
}

export type Item = {
    id: number,
    name: string,
    qty: number, // not sure if this makes sense, if I even allow a single item entry to be reused either all the uniquely identifying data would either be on the pivot table to location or all qty of an entry must share the same data
    description?: string,
    location?: string,
    serial?: string, // TODO include links or explanations why storing serial inventory is important for emergency situations
}

const locList: Location[] = [
    {
        name: 'Home(555 nowhere ave)',
        quad: [0,0,600,400],
        rgb: 0xCADD1E,
        last_modified: new Date(Date.now()-(1000*60*60*24*30*3)),
    },
    {
        name: 'Home(555 nowhere ave)/Kitchen',
        quad: [200,100, 500, 100, 500,300, 400,300, 400,250, 200,250],
        rgb: 0xF000F1,
    },
    {
        name: 'Home(555 nowhere ave)/Kitchen/Pantry',
        quad: [150,0,200,25],
        rgb: 0x00FF11
    },
    {
        name: 'Home(555 nowhere ave)/Garage',
        description: 'Storage Closet',
        quad: [100,250, 400,250, 400,700, 100,700],
        rgb: 0x00FF00,
        notes: 'Closet A is primarily storage for old toys, not suitable for electronics, being in the garage it is not sealed to moisture and tech/electronic media will be damage over time if not properly insulated',
    },
    {
        name: 'Home(555 nowhere ave)/Garage/ClosetA',
        description: 'Storage Closet',
        notes: 'Closet A is primarily storage for old toys, not suitable for electronics, being in the garage it is not sealed to moisture and tech/electronic media will be damage over time if not properly insulated',
    },
    {
        name: 'Home(555 nowhere ave)/PrimaryBed',
        quad: [],
    },
    {
        name: 'Home(555 nowhere ave)/Bedroom1',
        quad: [],
    },
    {
        name: 'Home(555 nowhere ave)/Bedroom2',
        quad: [],
    },
    {
        name: 'Home(555 nowhere ave)/Living',
        quad: [],
    },
    {
        name: 'Storage Unit (123 college town dr)',
        quad: [150,0,200,25],
        rgb: 0xFF11CC
    },
    {
        name: 'Storage Unit (123 college town dr)/Pallet2',
        quad: [150,0,200,25],
        rgb: 0x44DDEE
    },
]

let newInvId = 5

/** this function should only get run once when the fake data generates or when the next server clears for whatever reason, doesn't matter since it's just dumping in a bunch of random crap to show pagination working */
function* generateItems(total = 100) {
    let i = 0
    while (i++ < total) {
        yield {
            id: newInvId++,
            name: "randomItem" + i.toString().padStart(3,'0'),
            qty: 1,
        }

    }
}

const invList: Item[] = [
    {id: 0xABCDEF, name: 'TV', qty: 1, location: 'Home(555 nowhere ave)/Living Room'},
    {id: 0xFFFFFF, name: 'Kitchenaid', qty: 1, location: 'Home(555 nowhere ave)/Kitchen/Pantry'},
    {id: 0xFEDCBA, name: 'Bandsaw', qty: 1, location: 'Storage Unit (123 college town dr)/Pallet2'},
    {id: 0x1,      name: 'Playstation 5', serial: "qwertyuiop", qty: 1, location: 'Storage Unit (123 college town dr)/Pallet2'},
    {id: 2, qty: 1, name: 'added-thing', location: ''},
    {id: 3, qty: 1, name: 'thing 3', location: ''},
    ...generateItems(500)
]

type MapKey = {
    regex: RegExp,
    methods: string[],
}

const apiMap = new Map<MapKey, (groups?: {[key: string]: string}, body?: BodyInit|null|undefined, urlstring ?: string) => { status: number, statusText?: string, data?: object | Location[] | Location | LocationReturn | Item[] | Item | void}>()
apiMap.set(
    {regex:/\/api\/inventory(?:\?(?<querystring>.*)|)$/, methods: ['GET']},
    ({querystring} = {}, _) => {
        const params = new URLSearchParams(querystring)
        // assume page 1 if no page requested, pagesize defaults to 25
        let { pagesize, offset } = { pagesize: 25, offset: 0 , ...Object.fromEntries(params.entries()) }
        pagesize = Number(pagesize)
        offset = Number(offset)
        if (pagesize <= 10) {
            pagesize = 10
        }
        if (offset < 0) {
            offset = 0
        }
        // add sort by column options
        return { // records contain only minimal information about stored inventory
            status: 200,
            data: {
                offset,
                pagesize, // I think a more standard term might be limit... might change it later
                total: invList.length,
                records: invList.slice(offset, offset+pagesize),
            },
        }
    }
)

apiMap.set(
    { regex: /\/api\/inventory$/, methods: ['POST']},
    (_, body) => {
        if (body) {
            // check body data, in this case should be a FormData object or similar
            const name = (body as FormData).get('name')
            const location = (body as FormData).get('location') as string
            const description = (body as FormData).get('description') as string
            const serial = (body as FormData).get('serial') as string
            const ownership_date = (body as FormData).get('ownership_date')
            const proof_of_ownership = (body as FormData).get('proof_of_ownership')
            const images = (body as FormData).get('images')
            const flags = (body as FormData).getAll('flags')
            // bare minimum is to have a name, reminders can be generated for all other fields left unfilled
            if (!name) {
                return {status: 400, statusText: 'creating new inventory requires at least a name', data: {errors:['creating new inventory requires at least a name']}}
            }

            // TODO in the final version at least trim start of location of any errany whitespace and leading slashes to confuse the path adjacency

            const newInv = {
                id: newInvId++,
                name: name.toString(),
                description,
                ...(serial ? {serial} : {}),
                qty: 1,
                ...(location? {location: location.toString()} : {}),
            }

            invList.push(newInv)
            
            // if new Inventory has a location (not empty string)
            if (newInv.location && locList.every(l => l.name !== newInv.location)) {
                locList.push({ name: newInv.location })
            }
            // convert to Item and add to inventory map
            // create Location if needed -- no foreign keys but I want to at least try to emulate the actual DB
            // send success
            return {status: 200, statusText: 'record created' } // endpoint fail because it's not fully implemented
        } else {
            return {status: 400, data: {errors:['endpoint requires form data']}} // no body
        }
    }
)

apiMap.set(
    {regex: /^\/api\/inventory\/(?<itemId>\d*)$/, methods: ['GET']},
    ({itemId} = {}) => ({
        status: 200,
        data: invList.find(i => i.id === Number(itemId)),
    })
)

apiMap.set(
    { regex: /\/api\/location\/list/, methods: ['GET']},
    () => ({
        status: 200,
        data: locList.map((loc) => ({loc: loc.name, ...(loc.quad ? {quad: loc.quad} : {}), rgb: loc.rgb ?? 0xFFFFFF}))
    })
)

export type LocationReturn = Location & {
    sub: Location[]
    sib: Location[]
}

apiMap.set(
    { regex:/^\/api\/location\/(?<slug>.*)$/, methods: ['GET'] },
    ({slug} = {}) => {
        const entry = locList.find((loc) => loc.name === decodeURI(slug))
        if (!entry) { return {status: 404} }
        // then find all sub-locations to include minimal information about
        const currentPath = entry.name.split('/')

        const [sub, sib] = locList
        .reduce<[Location[], Location[]]>(([sub, sib], loc) => {
            const locPath = loc.name.split('/')
            if (
                locPath.length < currentPath.length // too short to be sib
                || locPath.length > currentPath.length + 1 // too long to be sub
                || !currentPath.slice(0,-1).every((v,i) => locPath[i] == v) // does not belong to same parent
                || (locPath.length == currentPath.length + 1 && locPath[currentPath.length-1] != currentPath.at(-1)) // sibling subs not allowed
                || (locPath.length == currentPath.length && currentPath.every((v,i) => locPath[i] == v)) // eliminate self
            ) {
                return [sub, sib]
            }
            const cl = {
                name: loc.name,
                quad: loc.quad ?? [],
                ...(loc.rgb ? {rgb: loc.rgb} : {}),
            }

            if (locPath.length > currentPath.length) {
                return [[...sub, cl], sib]
            }
            return [sub, [...sib, cl]]
        }, [[], []])

        return {
            status: entry ? 200 : 404,
            data: {
                ...entry,
                sub,
                sib,
            }
        }
    }
)

// const date3monthsago = Temporal.Now.plainDateISO().subtract(Temporal.Duration.from('P3M')) // if the Temporal API gets approved before I replace these faker functions
const date3monthsago = new Date()
date3monthsago.setMonth(date3monthsago.getMonth() - 3) // this frequency should be configurable
apiMap.set(
    { regex:/^\/api\/notifications$/, methods: ['GET']},
    () => ({
        status: 200,
        data: [
            ...invList
                .filter(a => !a.location) // this is a poor version of this condition, not sure what the actual DB values are gonna be
                .map(({id, name, location}) => ({
                    regarding: ['item', id],
                    message: `item "${name}" is listed as having no location (${location}), this is a reminder to fill in this additional information when you have a moment`,
                })),
            ...locList
                .filter(a=> !a.last_modified || a.last_modified < date3monthsago)
                .map(({name, last_modified}) => ({
                    regarding: ['location', name],
                    message: `location "${name}" has not been audited or updated in at least 3 months, you may want to verify the presence of all items in this location and add/move/remove any changes needed`,
                })),
            // the final version of this endpoint would check for other notifications I think of and maybe plugins... depends on how the backend plays out
        ],
    })
)

export { apiMap }