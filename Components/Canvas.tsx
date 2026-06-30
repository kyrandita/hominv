import { useEffect, useRef } from "react"

/**
 * It might be better to use some library canvas component to make this work, but right now I wanted to see
 * if I could make it work with less dependencies.
 * 
 * TODO maybe make this a useCanvas custom hook instead? not sure I'm gaining much by rendering it here, it just removes some direct control from the parent component I'd have to pass through and everything here can be done in a hook I think, at least worth an experiment
 */
export default function Canvas({draw, ...rest}:{draw?: (ctx: CanvasRenderingContext2D) => void, style: React.CSSProperties}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d')
            // console.log(context)
            if (context) { //realistically this canvas should never have another context set to it... but typescript is strict
                draw?.(context)
            }
        }
    }, [draw, canvasRef])

    return <canvas
        // I am intentionally scaling the canvas to keep the 'relative' dimensions of the location correct
        // compressing or stretching the displayed representation, not good for a generalized component
        ref={canvasRef}
        width={1000}
        height={1000}
        {...rest}
        >
    </canvas>
}