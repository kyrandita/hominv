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
    </div>
}