'use client'
import { useFetch as useFetchP } from "@/Utils/useFetchPromise"
import { HomInvSettings } from "../api/settings/route"
import { useEffect, useState } from "react"

export default function Settings() {

    const {data: settingsDataPromise, loading: settingsLoading, error: settingsError, refresh: refreshSettingsData} = useFetchP<HomInvSettings>('/api/settings')
    const [Notification_Auditing_enabled, setNotification_Auditing_enabled] = useState(false)
    const [Notification_Auditing_duration, setNotification_Auditing_duration] = useState("P3M") // not sure if I want this to stay a string, the API should reject if not formatted correctly but the UI can definitely reinforce that check

    useEffect(() => {
        settingsDataPromise?.then(async (settingsData) => {
            setNotification_Auditing_enabled(settingsData.Notifications.Auditing.enabled)
            setNotification_Auditing_duration(settingsData.Notifications.Auditing.duration)
        })
        // I could split out each and every part of setData into it's own internal state, useful for immediate feedback, whether I immediately fire off changes
        // to the server or wait for a "save" button... this would represent the intermediate state. Challenges to address in either scenario but I don't think
        // editing the output of the useFetch for the state is wise, this also allows type shifting to happen such a reinterpretting the Temporal Duration if needed
        // though since I'm presenting the string version to the user it may not be.

        // there also may be an argument to be made for each of these fieldsets to be their own component to keep things more manageable eventually but it's small enough right now
        // and I intend to keep data separated well so if that does need to happen it should be simple
    }, [settingsDataPromise])

    const onNotificationAuditingEnableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNotification_Auditing_enabled(e.currentTarget.checked)
    }
    const onNotificationAuditingDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.currentTarget.validity)
        setNotification_Auditing_duration(e.currentTarget.value)
    }

    return <div style={{columns: 3}}>
        <p>Settings for features I have not yet created, instead it is currently a checklist of features I plan to Proof of Concept here as I work on this</p>
        <p>In reality, Homebox does nearly everything I want this to be able to do and has more backing than I could hope for... It doesn&apos;t make a ton of sense to recreate a worse wheel... but I will possibly POC concepts of things I WISH Homebox did to show off the idea. If it seems good enough maybe it would be worth contributing to Homebox to make that project better...</p>

        <fieldset disabled={!Notification_Auditing_enabled}>
            <legend>
                Notifications &mdash;&nbsp;
                <label>
                Auditing reminders <input type="checkbox" checked={Notification_Auditing_enabled} onChange={onNotificationAuditingEnableChange} />
                </label>
            </legend>
            <p>This checkbox should disable all other inputs in this area when unchecked, I think I might leave any stored values alone rather than wipe out any settings the user has entered in case they are temporarily disabling such reminders. Which means all checks on this reminder will need to include an enabled check first</p>
            <label>
            Frequency
            <input type="text" value={Notification_Auditing_duration} onChange={onNotificationAuditingDurationChange} pattern="/^(-?)P(?=\d|T\d)(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)([DW]))?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/"></input>
            </label>
            <p>Currently accepting any valid ISO8601 Duration string, I want to make a nice reusable component for everyday users to input this duration instead but most existing components I found for duration input were specialized to &lt;24H or very specialized. I don&apos;t expect people to put in durations of years here but they might, I feel I can safely ignore anything &quot;day&quot; or less for this field once I have said customizeable component</p>
        </fieldset>

        {/* probably a bad use of article, but it works for now */}
        <article style={{breakInside: 'avoid-column'}}>
        <h2>Periodic Auditing tasks</h2>
        <p>reminders to the user to check the inventory to make sure it is still accurate. A box may have moved, a new DVD purchased but not added, Room rearranging changes where expensive things are kept. Accurate inventory helps in times of emergency. Homebox allows maintenance logs to be kept or scheduled for a single instance in the future and not for locations, only Items. There is no repeated RRule based maintenance scheduling at all.</p>
        <p>perhaps for Homebox this would be a add-on or plugin instead, though I am not seeing that as a thing yet for their project... I want to default to locations being audited on a period set by the user, defaulted to 3 months maybe, that reminds them to verify the locations contents. This would also hold true for container Items (Items with sub-items in Homebox terms) and the user may audit them all at once or at any level they prefer. My goal remains to gently urge the user to keep their inventory protecting their assets without getting frustrating or obnoxious to manage.</p>
        <p>Some Items/Locations may be marked as invalid for audits, the user must decide this</p>
        <p>A user might just &quot;pass&quot; an audit saying it was good, scan a barcode on each item, manually check things off the list, add any note they like to the audit record (something like container seal number or whatever)</p>
        <p>Any Items not present during the audit will be marked as missing upon completion of this audit, Additional Items either prompted to be created or moved from other locations they are in inventory (up to the user to confirm they are the same instance of inventory and not a second item), this process should be designed to be abandoned and resumed at any point along the process, possibly from another device so as to not lose data if the user needs to prioritize other activities. Accepting that it is not reasonable to completely duplicate all client side data to the server after each action, the point is to minimize data loss, not store a server state for each modal the user might encounter</p>
        </article>

        <article style={{breakInside: 'avoid-column'}}>
        <h2>Plugins/Extensions</h2>
        <p>Being as I&apos;ve only played with Homebox for a very short while now someone might be able to correct a misunderstanding, but it doesn&apos;t appear to have any extension/plugin system built in. `External Label Service` generation is the closest I found in the docs. Obviously this is a complex proposal and since this is just a quick list and I have not given it sufficient thought I will leave it there, only mentioned because it seemed reasonable when writing other ideas that it could be an optional feature and as such... An extension</p>
        </article>
        
        <article>
        <h2>Associated Barcodes / Alternate Identifiers</h2>
        <p>allow associating external barcodes with inventory. generated IDs are great for many situations but barcoding everything you own is a level of tedium that many users probably won&apos;t do (at least in my experience) so being able to scan existing UPC/ISBN/ETC barcodes in as alternate identifiers for products would ease some of that for certain products, obviously not all product has additional barcodes to add, and it&apos;s not a unique identifier so we&apos;ll have to be careful warning the user during audits and certain other situations that the identifier used may belong to a duplicate item and that they should verify independently that others of the same item are still where they ought to be as well or check any more specific identifiers if possible without overdoing it</p>
        <p>Perhaps while adding the identifier they can mark whether to treat it as unique for their inventory? only becomes a problem if they buy a second copy later, but I suppose that might be part of the edge case warnings to the user of alternate identifiers</p>
        <p>A complicated suggestion maybe, since I haven&apos;t gotten far enough in my own implementation to run into any complex issues it may cause</p>
        <p>Home Box allows custom fields, and they probably work with search to find things with them if you store the UPC/ISBN with them, whether that would be sufficient for an auditing flow plugin or not would be something to consider</p>
        </article>
    </div>
}
