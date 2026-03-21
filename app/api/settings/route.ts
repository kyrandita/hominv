/**
 * Route for settings changes, since all settings have a default state and should only be changed key by key
 * there will be no POST route. Input and Merge Validation will probably be the most complex thing here...
 */

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
    // TODO should this be output in JSONPath format?
    return Response.json({ data: settingData })
}

/**
 * Patch because I want only the Request defined keys to be set, unset keys should be left unchanged unless system logic dictates otherwise
 * @param r 
 */
export async function PATCH( r: Request ) {
    // 
}

export async function DELETE( r: Request ) {
    // TODO complication probably in any user provided array entry removal, by index or by value?
    // not even sure we'll have any settings of that nature yet...
}