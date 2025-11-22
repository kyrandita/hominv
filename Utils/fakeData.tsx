type Location = {
    name: string,
    quad?: number[], // This is probably not what I need, the quad isn't on the location itself, but only on it's relation to it's parent, the location only needs a WxH
    rgb?: number,
}

type Item = {
    id: number,
    name: string,
    qty: number,
    location: string,
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

const apiMap = new Map<RegExp, (groups?: {[key: string]: string}) => {status: number, record: object | any[]}>()
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

export { apiMap }