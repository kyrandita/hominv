import { getPageData, locList } from '@/Utils/fakeData';
import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest) {
    return NextResponse.json({
        status: 200,
        data: getPageData(locList, Number(request.nextUrl.searchParams.get('offset') ?? 0), Number(request.nextUrl.searchParams.get('pagesize') ?? 10)),
    });  
}

// export async function POST(request: NextRequest) {
// //   const location = await request.json();

//   try {
//     // Save the location to your database or perform other actions
//     // await saveLocation(location);

//     return NextResponse.json({ message: 'Location created successfully' });
//   } catch (error) {
//     return new NextResponse('Failed to create location', { status: 500 });
//   }
// }