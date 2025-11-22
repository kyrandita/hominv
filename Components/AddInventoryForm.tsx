import { Autocomplete, Chip, TextField } from "@mui/material";
import { FormEventHandler } from "react";


export default function AddInventoryForm({OnSubmit}: {OnSubmit?: FormEventHandler}) {
    return <>
        <form onSubmit={OnSubmit} style={{flexDirection: "column", display: "flex"}}>
            <p>This form does nothing yet, just an example of using the MUI <code>&lt;Dialog&gt;</code> instead of the normal <code>&lt;dialog&gt;</code> element, it's a bit simpler setup wise for some things but I like to minimize imports when possible, MUI probably isn't at high risk of being depricated any time soon but I just like to know multiple ways of doing things, perferably at least one of those being as vanilla as I can get away with</p>
            <label>Upload Inventory Images<input multiple type="file" name="images" accept="image/*" capture="environment"></input></label>
            <p>not sure whether I want it to allow multiple images really, maybe just one per for simplicity here, additional specific images can be for other more specific scenarios... maybe, either way the server side needs to downscale images taken by the phones... probably configurable with an intelligent default</p>
            <label>Product Name<input type="text" name="name" max={50} placeholder="Flaystation 3"></input></label>
            {/* the text input should have a datalist of all locations, if we expose full paths then that could work, but also scannable IDs if using those... but also not required to be from the datalist because we may create a new location on the fly, maybe an on screen warning/reminder if they are doing it, but not one that adds additional clicks. */}
            <label>Location<input type="text" name="location" list="loclist"></input></label>
            {/* onBlur if entry is not on the datalist, a subtle reminder that they are creating a new location */}
            <datalist id="loclist">
                <option value="Home(555 nowhere ave)">ABCD</option>
                <option value="Home(555 nowhere ave)/Kitchen"></option>
                <option value="Home(555 nowhere ave)/Kitchen/Pantry"></option>
                <option value="Storage Unit (123 college town dr)"></option>
            </datalist>
            <label>Description<textarea name="description" placeholder="The successor to the best selling Flaystation 2, flaying nearly twice as many enemies per day as it's predecessor with quadruple the terraflops :D"></textarea></label>
            <label>Serial<input type="text" name="serial"></input></label>
            <label>Date of initial Ownership<input type="date" name="ownership_date" ></input></label>
            <label>Proof of Ownership<input type="file" name="proof_of_ownership" accept="image/*" capture="environment"></input></label>
            <label>Flags<Autocomplete
                multiple
                freeSolo
                // can populate this options with existing categories/flags from the system
                options={['electronics', 'appliance', 'media', 'jewelry', 'furniture', 'collectable']}
                renderInput={(params) => <TextField {...params} label="Movie" />}
                ></Autocomplete></label>
            {/* TODO using the MUI Autocomplete component to have chips in this manner means I can't use the base form onSubmit in the same way so I'll have to refactor that */}

            {/* <label><input></input></label> */}
            <input type="submit"></input>
        </form>
    </>
}