export type Location = {
    name: string,
    quad?: number[], // This is probably not what I need, the quad isn't on the location itself, but only on it's relation to it's parent, the location only needs a WxH, maybe a polygon
    rgb?: number,
}

type Item = {
    id: number,
    name: string,
    qty: number,
    location?: string,
    serial?: string, // TODO include links or explanations why storing serial inventory is important for emergency situations
}

export const locations: {[key: string]: Location} = {
    "Home(555 nowhere ave)": {
        name: 'Home(555 nowhere ave)',
        quad: [0,0,600,400],
        rgb: 0xCADD1E
    },
    "Home(555 nowhere ave)/Kitchen": {
        name: 'Home(555 nowhere ave)/Kitchen',
        quad: [0,0,200,100],
    },
    "Home(555 nowhere ave)/Kitchen/Pantry": {
        name: 'Home(555 nowhere ave)/Kitchen/Pantry',
        quad: [150,0,200,25],
        rgb: 0x00FF11
    },
    "Storage Unit (123 college town dr)": {
        name: 'Storage Unit (123 college town dr)',
        quad: [150,0,200,25],
        rgb: 0xFF11CC
    },
    "Storage Unit (123 college town dr)/Pallet2": {
        name: 'Storage Unit (123 college town dr)/Pallet2',
        quad: [150,0,200,25],
        rgb: 0x44DDEE
    },
}

export const inventory: {[key: number]: Item} = {
    0xABCDEF: {id: 0xABCDEF, name: 'TV', qty: 1, location: 'Home(555 nowhere ave)/Living Room'},
    0xFFFFFF: {id: 0xFFFFFF, name: 'Kitchenaid', qty: 1, location: 'Home(555 nowhere ave)/Kitchen/Pantry'},
    0xFEDCBA: {id: 0xFEDCBA, name: 'Bandsaw', qty: 1, location: 'Storage Unit (123 college town dr)/Pallet2'},
    0x1: {id: 0x1, name: 'Playstation 5', serial: "qwertyuiop", qty: 1, location: 'Storage Unit (123 college town dr)/Pallet2'},
}

type MapKey = {
    regex: RegExp,
    methods: string[],
}

const apiMap = new Map<MapKey, (groups?: {[key: string]: string}, body?: BodyInit|null|undefined) => { status: number, statusText?: string, data: object | Location[] | Location | Item[] | Item | void}>()
apiMap.set(
    {regex:/\/api\/inventory$/, methods: ['GET']},
    () => ({ // records contain only minimal information about stored inventory
        status: 200,
        data: Object.values(inventory),
    })
)

let newInvId = 5
apiMap.set(
    { regex: /\/api\/inventory$/, methods: ['POST']},
    (_,body) => {
        if (body) {
            console.log(body)
            //check body data, in this case should be a FormData object or similar
            const name = (body as FormData).get('name')
            const location = (body as FormData).get('location')
            const description = (body as FormData).get('description')
            const serial = (body as FormData).get('serial')
            const ownership_date = (body as FormData).get('ownership_date')
            const proof_of_ownership = (body as FormData).get('proof_of_ownership')
            const images = (body as FormData).get('images')
            const flags = (body as FormData).getAll('flags')
            // bare minimum is to have a name, reminders can be generated for all other fields left unfilled
            if (!name) {
                return {status: 400, statusText: 'creating new inventory requires at least a name', data: JSON.stringify(['creating new inventory requires at least a name'])}
            }
            const newInv = {
                id: newInvId,
                name: name.toString(),
                qty: 1,
                ...(location? {location: location.toString()} : {}),
            }
            inventory[newInvId++] = newInv
            
            // convert to Item and add to inventory map
            // create Location if needed -- no foreign keys but I want to at least try to emulate the actual DB
            // send success
            return {status: 200, statusText: 'record created'} // endpoint fail because it's not fully implemented
        } else {
            return {status: 400, data: JSON.stringify(['endpoint requires form data'])} // no body
        }

    }
)

apiMap.set(
    {regex: /^\/api\/inventory\/(?<itemId>\d*)$/, methods: ['GET']},
    ({itemId}) => ({
        status: 200,
        data: inventory[Number(itemId)],
    })
)

apiMap.set(
    { regex: /\/api\/location\/list/, methods: ['GET']},
    () => ({
        status: 200,
        data: Object.entries(locations).map(([locind, loc]) => {
            return {loc: locind, ...(loc.quad ? {quad: loc.quad} : {}), rgb: loc.rgb ?? 0xFFFFFF}
        })
    })
)

apiMap.set(
    { regex:/^\/api\/location\/(?<slug>.*)$/, methods: ['GET'] },
    ({slug}) => ({
        status: 200,
        data: Object.entries(locations).find(([locind, loc]) => locind === decodeURI(slug))?.[1] ?? {},
    })
)

export { apiMap }