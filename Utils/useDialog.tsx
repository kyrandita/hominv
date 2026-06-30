import { RefObject, useCallback, useRef, useSyncExternalStore } from "react"

// with the declarative invoker commands API, popover API, and interest invokers I think most of the functionality provided
// by this component is covered by now native html features. Only situations managed by code not compatible with the declarative
// style would benefit from this, and that mostly because this wraps the native functions in a 'React' style wrapper

// at this point the only thing it's doing is putting the 'isOpen' variable in play

export type useDialogHook = {
    ref: RefObject<HTMLDialogElement | null>,
    isOpen: boolean,
    openDialog: () => void,
    closeDialog: () => void,
}
// rather than recieving a ref, maybe passing back a callbackRef would be better... 
export const useDialog = (modal: boolean = false) : useDialogHook => {
    const dRef = useRef<HTMLDialogElement>(null)

    const subscribe = useCallback((cb : () => void) => {
        if (dRef.current) {
            // dialogRef.current.addEventListener('cancel', cb) // not this one unless I need to potentially cancel the closing
            dRef.current.addEventListener('toggle', cb)
        }
        return () => {
            if(dRef.current) {
                dRef.current.removeEventListener('toggle', cb)
            }
        }
    }, [dRef])

    // adding the :popover-open condition here only matters if you use the dialog as a popover target, if only using a popover this whole thing is probably not needed
    const getSnapshot = useCallback(() => !!dRef.current?.open || !!dRef.current?.matches(':popover-open'), [dRef])
    const isOpen = useSyncExternalStore(subscribe, getSnapshot)
    const openDialog = () => {
        if (dRef.current) {
            if (modal)
                dRef.current.showModal()
            else
                dRef.current.show()
        }
    }

    const closeDialog = () => {
        if (dRef.current) {
            dRef.current.close()
            // no need for manual trigger, this will trigger the 'close' event on the dialog anyway
        }
    }

    return { ref: dRef, isOpen, openDialog, closeDialog }
}