import { FetchReturn, useFetch } from "./useFetch"

// obviously this hook only works for endpoints using my quickly thrown together pagination interface
// but the concept should work for others with minor adjustments
// there are undoubtedly hooks that accomplish this same thing in some library somewhere
// in some more standardized pagination format

export type PagedAPI<T = never> = {
    records: T[],
    offset: number, // min 0, max record count -1 or however I treat asking for offset out of bounds
    pagesize: number, // min 1, max ... not sure there is a good reason to limit max, let the developer choose it based off the data returned
    total: number, // total record count, this might be restricted to records the current user can know about if it's a restricted data set, but it should help the UI determine it's next/prev pagination controls
}

export type PagedFetchReturn<T> = FetchReturn<PagedAPI<T>> & {
    pageCur: number,
    pageTotal: number,
    pagefuncs: {
        changePage: (pageChange: number) => URL,
        toPage: (pageNumber: number) => URL,
        firstPage: () => URL,
        nextPage: () => URL,
        prevPage: () => URL,
        lastPage: () => URL,
        changePageSize: (newPageSize: number, roundToPage?: boolean) => URL,
    }
}

export const usePagedFetch = <T,>(url: RequestInfo | URL): PagedFetchReturn<T> => {
    const {data, loading, error, refresh} = useFetch<PagedAPI<T>>(url)
    const urlstring = url instanceof Request ? url.url : url.toString()

    /**
     * This function respects `offset` maybe not being an exact multiple of `pagesize` and just moves n * `pagesize` from the current `offset`
     * If pageChange value would move outside bounds of dataset, value is clamped to within offset valid range (0 <-> total - 1)
     * 
     * I'm not certain of a good use case for exporting this really, most pagination implementations I've seen use prev/next alongside beginning/end or page numbers... not usually next->next or prev->prev
     * @param pageChange pages to shift offset, literal value `1` moves one `pagesize` towards `total`, `-1` moves one pagesize towards 0
     * @returns URL
     */
    const changePage = (pageChange: number): URL => {
        const nurl = new URL(urlstring)
        if (data) {
            // maybe clear other params, but if working as designed no other params should exist
            nurl.searchParams.set('pagesize', String(data.pagesize))
            nurl.searchParams.set(
                'offset', 
                String(
                    Math.min(
                        Math.max(// make sure offset never less than 0
                            data.offset + (data.pagesize * pageChange),
                            0
                        ),
                        // then that it can't go beyond the last record, arbitrary choice of mine to impose this in this way
                        data?.total - 1
                    )
                )
            )
        }
        return nurl
    }

    /**
     * Shifts to an exact multiple of `pagesize` for specific page numbers ignoring any `offset` mismatch with `pagesize`
     * @param pageNumber number of requested page, will be clamped to within (1 <-> Math.floor(total/pagesize)), negative page indexing is allowed
     * @returns 
     */
    const toPage = (pageNumber: number) => {
        const nurl = new URL(urlstring)
        if (data) {
            nurl.searchParams.set('pagesize', String(data.pagesize))
            const pageCount = Math.ceil(data.total / data.pagesize)
            let actualPageNumber = pageNumber
            switch(true) {
                // if requested page is out of index (either forward or backwards)
                case Math.abs(actualPageNumber) > pageCount:
                // or if page requested is not an integer, I'm not supporting requesting page `2.3`, though if someone implementing this hook for their own use wants to it probably wouldn't be that difficult
                case !Number.isInteger(actualPageNumber):
                // or if requesting page 0 (in a 1 indexed concept)
                case actualPageNumber == 0:
                    actualPageNumber = 1
                    break
                // if negative indexed, I feel like there is some fancy algorithmic trick to do this cleaner but this works until I remember it
                case actualPageNumber < 0:
                    actualPageNumber = pageCount + actualPageNumber + 1
            }
            nurl.searchParams.set(
                'offset', 
                String(
                    Math.min(
                        Math.max(// make sure offset never less than 0
                            (data.pagesize * (actualPageNumber - 1)),
                            0
                        ),
                        // new offset in toPage must respect pagesize instead of by record
                        pageCount * data.pagesize
                    )
                )
            )
        }
        return nurl
    }

    const firstPage = () => toPage(1)
    const nextPage = () => changePage(1)
    const prevPage = () => changePage(-1)
    const lastPage = () => toPage(-1)

    /**
     * 
     * @param newPageSize new page size, must be a positive integer, values less than 1 will be shifted to 1, floats will be truncated
     * @param roundToPage whether to adjust offset to nearest lower multiple of `newPageSize`
     * @returns 
     */
    const changePageSize = (newPageSize: number, roundToPage: boolean = false) => {
        const nurl = new URL(urlstring)
        if (data) {
            // if rounding this rounds down to nearest page that will in theory contain the first record of the current page/offset
            nurl.searchParams.set('offset', String(roundToPage ? Math.floor(data.offset / newPageSize) * newPageSize : data.offset))
            nurl.searchParams.set('pagesize', String(Math.max(Math.floor(newPageSize), 1)))
        }
        return nurl
    }

    return {
        data, loading, error, refresh,
        pageCur: data ? 1 + (data?.offset / data?.pagesize) : 1, // I'm leaving this as a float to quickly indicate you're not at a exact `pagesize` page, easy enough to floor if the dev needs to
        pageTotal: data ? Math.ceil(data.total / data.pagesize) : 1,
        pagefuncs: { changePage, toPage, firstPage, nextPage, prevPage, lastPage, changePageSize }
    }
}