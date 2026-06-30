import { Location } from "@/Utils/fakeData";
import Link from "next/link";
import { useDialog } from "@/Utils/useDialog";

export default function LocationRow({location: {name, quad, rgb}}: {location: Location}) {
    // const dref = useRef<HTMLDialogElement>(null)

    // this is a wholly insufficient id cleanup, works currently because I don't have other invalid characters in location names, but I should either switch to generated ids or make a more comprehensive string->(css/html/js)id function, for this single popover use case only html IDs may matter
    const LocationID = `LocationRow-${name.replaceAll(/[ \t\n\(\)\/\\]/g,'-')}`
    // in this case it's not needed I think, but other cases that create IDs on the page might instead use a sequence, possibly from a generator function, for it's IDs.
    // this will prevent collisions and unexpected behaviors when using any html behavior that utilizes IDs as unique identifiers as they are designed and intended to be
    // this also implies that any features implemented

    const rgbString = `#${rgb?.toString(16).padStart(6, '0')}`

    return <tr key={name}>
        <td><Link href={`/location/${name}`}>{name}</Link></td>
        <td>{JSON.stringify(quad)}</td>
        <td style={{backgroundColor: rgbString, color: `contrast-color(${rgbString})`}}>{rgb?.toString(16).toUpperCase().padStart(6, "0")}</td>
        <td>
            <button
                popoverTarget={`${LocationID}-menu`}
                // style={{anchorName: `--menu-for-${LocationID}`}}
                >
                    pop ⦀≡≣
            </button>
            <button
                commandfor={`${LocationID}-menu`}
                command="toggle-popover"
                // style={{backgroundColor: isOpen? 'green' : 'revert-rule'}}
                // onClick={openDialog}
                // inert={isOpen}
                >action menu</button>
            <dialog closedby="any" popover='auto' id={`${LocationID}-menu`}
                // style={{positionAnchor:`--menu-for-${LocationID}`}}
                >
                <button commandfor={`${LocationID}-menu`} command="hide-popover">X</button>
                <p>action menu pertaining to record <br />{name}</p>
                <button onClick={() => alert(`add sub to ${name}`)}>add sub-location</button>
                <button onClick={() => alert(`remove ${name}`)}>remove location</button>
            </dialog>
        </td>
    </tr>
}