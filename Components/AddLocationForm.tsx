import { Location } from "@/Utils/fakeData";
import { useFetch } from "@/Utils/useFetch";
import { FormEvent, useState } from "react";

export default function AddLocationForm({OnSubmit, }: {OnSubmit?: (formData: FormData) => void}) {
    const [sending, setSending] = useState(false)
    const {data: locations, loading, error} = useFetch<Location[]>('/api/location/list')

    async function handleFormSubmit(e: FormEvent) {
        if (!sending) { // do nothing if form has already been submitted and are awaiting latest response
            setSending(true)
            // maybe some client-side validation can be done first, if anything is wrong we can stop and alert before submitting bad data to the "server"
            e.preventDefault() // prevents natural close of modal from form submission, gives a moment to validate form I guess and close programatically? or maybe only prevent when issue detected?
            const fd = new FormData(e.target as HTMLFormElement)
            console.log(e, fd.entries())
            const r = await OnSubmit?.(fd)
            // if (!r) if submission failed... what? if the component recieves additional error props or whatever from the submission handler then it'll render those, is this variable needed the way I'm doing this now?
            setSending(false)
        }
    }

    return <form method={'dialog'} onSubmit={handleFormSubmit} style={{flexDirection: "column", display: "flex"}}>
        {/* the datalist may still make sense here to help users define paths they are adding to, if we stick with full path representation in the UI, though prefilling from the location you are "adding" to would likely work better */}
        <label>Location<input type="text" name="location" list="loclist"></input></label>
        <datalist id="loclist">
            {!loading && locations && locations.map(loc => <option key={loc.name} value={loc.name}></option>)}
        </datalist>
        <label>Description<textarea name="description" placeholder="Building/Room/Box"></textarea></label>
        <input type="submit"></input>
    </form>
}