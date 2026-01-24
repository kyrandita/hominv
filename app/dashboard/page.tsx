'use client'
import UserContext from "@/Contexts/UserContext"
import { useFetch } from "@/Utils/useFetch"
import { List, ListItem } from "@mui/material"
import { redirect } from "next/navigation"
import { useContext } from "react"
import './page.css'
import { PagedAPI, PagedFetchReturn } from "@/Utils/usePagedFetch"
import { Location } from "@/Utils/fakeData"

export default function Dashboard() {
    const user = useContext(UserContext)
    if (!user.isLoggedIn) {
        redirect('/') // TODO better to do this in routing I think, but with the default create next app this is how it is right now
    }
    // TODO define the notification type to at least document what I want to do?
    // TODO also, not necessarily paginated in the same way, but some interface to select notification type and limit record count to not overwhelm memory quite this badly
    const {data: notifications, loading: notificationLoading, error: notificationError} = useFetch<{regarding: (string|number)[], message: string}[]>('/api/notifications')
    const {data: isum, loading: isumLoading, error: isumError} = useFetch<{total:number,cat:{[key: string]: number}}>('/api/inventory/summary') // paginated endpoint, only grabbing first page here, not sure if I'm gonna redo this or not yet

    return <main className={"Dashboard"}>
        <div>
            <p>
                widgets would go here, maybe a full summary of value stored at each location and the totals, reminders could display here if the user wants to periodically audit their possessions? check that things are where they are in the system, or reminders for maintenance of some possessions? not sure if that is a feature that I want just yet. Maybe also a log of activity, added new DVD, sold a car, store sold item paperwork maybe? really not sure yet, will have to see what all comes out as I add features
            </p>
            <div>
                Inventory Summary, just count by category right now
                <br />
                <details>
                    <summary>Category Summary</summary>
                    <dl>
                        {isum && Object.entries(isum['cat']).map(([ik, iv], i) => 
                            <div key={i}>
                                <dt>{ik}</dt>
                                <dd>{iv}</dd>
                            </div>
                        )}
                    </dl>
                </details>
                <br />
                {isum && isum.total}
            </div>
            <div>
                Currently this just shows notifications to accomplish the following
                <ul>
                    <li>any inventory stored in &quot;/&quot; (the nowhere location... or maybe <code>null</code>) reminding the user to move them to the correct locations</li>
                    <li>reminders to audit inventory that hasn&apos;t been confirmed in X timespan to verify it&apos;s continued ownership and location, just a soft reminder to keep up the inventory mostly</li>
                </ul>
            </div>
            <p>
                a section for plugin notifications maybe? if they want to include reminders for maintenance and repair scheduling or whatever plugins add, not really thinking about a plugin API yet...
            </p>
        </div>
        <List className="notifications card">
            {notificationLoading && <span>Loading</span>}
            {!notificationLoading
                && !notificationError
                && notifications
                && <>
                {notifications.slice(0, 19).map(({regarding, message}) =>
                    <ListItem key={regarding.join('-')}><h4>{regarding.join('-')}</h4>{message}</ListItem>
                )}
                {notifications.length > 19 && <ListItem>{`… ${notifications.length-19} more notifications`}</ListItem>}
                </>
            }
            {!!notificationError && <span>{notificationError.message}</span>}
        </List>
    </main>
}