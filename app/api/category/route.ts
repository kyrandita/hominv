import { Categories } from "@/Utils/fakeData";

// TODO restructure categories to reflect better what the final DB structure might give, the API will still likely abstract out
// many of the foreign keys and such as needed, but it definitely won't be just a string array

export async function GET( r: Request ) {
    return Response.json({ data: Categories })
}