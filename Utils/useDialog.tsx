import { RefObject, useCallback, useRef, useSyncExternalStore } from "react"

export type useDialogHook = {
    ref: RefObject<HTMLDialogElement | null>,
    isOpen: boolean,
    openDialog: () => void,
    closeDialog: () => void,
}
// rather than recieving a ref, maybe passing back a callbackRef would be better... 
export const useDialog = (modal: boolean = false) : useDialogHook => {
    const listeners = new Set<() => void>()
    const dRef = useRef<HTMLDialogElement>(null)

    const subscribe = useCallback((cb : () => void) => {
        listeners.add(cb)
        if (dRef.current) {
            // dialogRef.current.addEventListener('cancel', cb) // not this one unless I need to potentially cancel the closing
            dRef.current.addEventListener('close', cb)
        }
        return () => {
            listeners.delete(cb)
            if(dRef.current) {
                dRef.current.removeEventListener('close', cb)
            }
        }
    // listeners updating is a mutable bit of data and should not trigger this effect, only be used to manage... well... listeners
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dRef])

    const getSnapshot = useCallback(() => !!dRef.current?.open, [dRef])
    const isOpen = useSyncExternalStore(subscribe, getSnapshot)
    const openDialog = () => {
        if (dRef.current) {
            if (modal)
                dRef.current.showModal()
            else
                dRef.current.show()
            // trigger callback because opening doesn't trigger event
            listeners.forEach(c=>c())
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