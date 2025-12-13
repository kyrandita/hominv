import { useEffect, useRef } from "react"

/**
 * It might be better to use some library canvas component to make this work, but right now I wanted to see
 * if I could make it work with less dependencies.
 */
export default function Canvas({draw, ...rest}:{draw?: (ctx: CanvasRenderingContext2D) => void}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d')
            // console.log(context)
            if (context) { //realistically this canvas should never have another context set to it... but typescript is strict
                draw?.(context)
            }
        }
    }, [draw])

    return <canvas
        // I am intentionally scaling the canvas to keep the 'relative' dimensions of the location correct
        // compressing or stretching the displayed representation
        ref={canvasRef}
        width={1000}
        height={1000}
        {...rest}
        >
    </canvas>
}