import { Location } from "@/Utils/fakeData";
import { useFetch } from "@/Utils/useFetch";
import { FormEvent } from "react";

export default function AddLocationForm({OnSubmit, }: {OnSubmit?: (formData: FormData) => void}) {
    const {data: locations, loading, error} = useFetch<Location[]>('/api/location/list')

    function handleFormSubmit(e: FormEvent) {
        e.preventDefault()
        const fd = new FormData(e.target as HTMLFormElement)

        OnSubmit?.(fd)
    }

    return <>
        <form onSubmit={handleFormSubmit} style={{flexDirection: "column", display: "flex"}}>
            {/* the datalist may still make sense here to help users define paths they are adding to, if we stick with full path representation in the UI, though prefilling from the location you are "adding" to would likely work better */}
            <label>Location<input type="text" name="location" list="loclist"></input></label>
            <datalist id="loclist">
                {!loading && locations && locations.map(loc => <option key={loc.loc} value={loc.loc}></option>)}
            </datalist>
            <label>Description<textarea name="description" placeholder="Building/Room/Box"></textarea></label>

            {/* <label><input></input></label> */}
            <input type="submit"></input>
        </form>
    </>
}