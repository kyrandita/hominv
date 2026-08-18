import { LocationReturn, locList, LocationDetailed } from '@/Utils/fakeData';
import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) : Promise<NextResponse<{status:200,data:LocationReturn} | {status:404}>> {
    const { id } = await params
    // this matches on name currently but eventually this should be the ID of the record... though the name is unique and technically a valid ID even if not the primary... just need to be careful because it can change
    const entry = locList.find((loc) => loc.name === decodeURI(id))
    if (!entry) { return NextResponse.json({status: 404}) }

    // then find all sub-locations to include minimal information about
    const currentPath = entry.name.split('/')

    const [sub, sib] : [LocationDetailed[], LocationDetailed[]] = locList
        .reduce<[LocationDetailed[], LocationDetailed[]]>(([isub, isib], loc) => {
            const locPath = loc.name.split('/')
            if (
                locPath.length < currentPath.length // too short to be sib
                || locPath.length > currentPath.length + 1 // too long to be sub
                || !currentPath.slice(0,-1).every((v,i) => locPath[i] == v) // does not belong to same parent
                || (locPath.length == currentPath.length + 1 && locPath[currentPath.length-1] != currentPath.at(-1)) // sibling subs not allowed
                || (locPath.length == currentPath.length && currentPath.every((v,i) => locPath[i] == v)) // eliminate self
            ) {
                return [isub, isib]
            }
            const cl : LocationDetailed = {
                name: loc.name,
                // just strip the parent name from the child, seems safe for the +1 case, the root node will never load as a child like this
                name_short: loc.name.slice(entry.name.length + 1),
                quad: loc.quad ?? [],
                ...(loc.rgb ? {rgb: loc.rgb} : {}),
            }

            if (locPath.length > currentPath.length) {
                return [[...isub, cl], isib]
            }
            return [isub, [...isib, cl]]
        }, [[], []])

    return NextResponse.json({
        status: 200,
        data: {
            ...entry,
            sub,
            sib,
        },
    });  
}