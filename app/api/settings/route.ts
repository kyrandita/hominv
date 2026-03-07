
export interface HomInvSettings {
    Notifications: {
        Auditing: {
            enabled: boolean
            duration: string // Temporal.Duration
        }
    }
}

/**
 * This is in memory for now, will eventually need to be pulled from an actual DB, whether to cache here or rely on the DB engine caching will come later I think
 */
const settingData: HomInvSettings = {
    Notifications: {
        Auditing: {
            enabled: true,
            duration: "P3M" // Temporal.Duration.from("P3M")
        }
    }
}



export async function GET( r: Request ) {
    return Response.json({ data: settingData })
}