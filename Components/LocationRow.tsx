import { Location } from "@/Utils/fakeData";
import Link from "next/link";
import { useDialog } from "@/Utils/useDialog";

export default function LocationRow({location: {name, quad, rgb}}: {location: Location}) {
    // const dref = useRef<HTMLDialogElement>(null)
    const { ref: dref, isOpen, openDialog, closeDialog } = useDialog()

    return <tr key={name}>
        <td><Link href={`/location/${name}`}>{name}</Link></td>
        <td>{JSON.stringify(quad)}</td>
        <td>{rgb?.toString(16).toUpperCase().padStart(6, "0")}</td>
        <td>
            <button onClick={openDialog} inert={isOpen}>action menu</button>
            <dialog ref={dref} closedby="any">
                <button onClick={closeDialog}>X</button>
                <p>action menu pertaining to record {name}</p>
                <button onClick={() => alert(`add sub to ${name}`)}>add sub-location</button>
                <button onClick={() => alert(`remove ${name}`)}>remove location</button>
            </dialog>
        </td>
    </tr>
}