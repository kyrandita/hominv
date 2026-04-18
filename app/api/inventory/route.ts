import { invList } from "@/Utils/fakeData"

const getPageData = <T,U>(data: Array<T>, offset: number = 0, pagesize: number = 25, transform?: (arg0: T) => U): PagedAPI<T|U> => {
    // logic for if offset goes past array size and such
    const records = data.slice(offset, offset + pagesize)
    return {
        offset,
        pagesize,
        total: data.length,
        records: transform ? records.map(transform) : records
    }
}

export async function GET( r: Request ) {
    const url = new URL(r.url)
    const params = url.searchParams

    // assume page 1 if no page requested, pagesize defaults to 25
    let { pagesize, offset } = { pagesize: 25, offset: 0 , ...Object.fromEntries(params.entries()) }
    const filter = params.getAll('filter')
    pagesize = Number(pagesize)
    offset = Number(offset)

    let inventory = invList
    if (filter.length) {
        const filterSet = new Set(filter)
        inventory = inventory.filter(item => {
            const itemSet = new Set(item.categories)
            return filterSet.isSubsetOf(itemSet)
        })
    }

    if (pagesize <= 10) {
        pagesize = 10
    }

    // TODO offset should never be greater than the record count, maybe handle that inside the getPageData function?
    if (offset < 0) {
        offset = 0
    }


    // add sort by column options
    return Response.json({ // records contain only minimal information about stored inventory
        status: 200,
        data: getPageData(inventory, offset, pagesize),
    })
}

