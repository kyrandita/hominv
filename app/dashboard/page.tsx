'use client'
import UserContext from "@/Contexts/UserContext"
import { redirect } from "next/navigation"
import { useContext } from "react"

export default function Dashboard() {
    const user = useContext(UserContext)
    if (!user.isLoggedIn) {
        redirect('/')
    }
    return <div>
    <p>
        widgets would go here showing a breakdown of root locations, maybe a full summary of value stored at each and the totals, reminders could display here if the user wants to periodically audit their possessions? check that things are where they are in the system, or reminders for maintenance of some possessions? not sure if that is a feature that I want just yet. Maybe also a log of activity, added new DVD, sold a car, store sold item paperwork maybe? really not sure yet, will have to see what all comes out as I add features
    </p>
    <div>
        <p>
            notifications of any inventory stored in &quot;/&quot; (the nowhere location... or maybe <code>null</code>) remindin the user to move them to the correct locations
        </p>
        <p>
            depending on configuration, reminders to audit inventory that hasn&apos;t been confirmed in X timespan to verify it&apos;s continued ownership and location, just a soft reminder to keep up the inventory mostly
        </p>
        <p>
            a section for plugin notifications maybe? if they want to include reminders for maintenance and repair scheduling or whatever plugins add, not really thinking about a plugin API yet...
        </p>
    </div>
    </div>
}