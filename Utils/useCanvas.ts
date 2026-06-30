import { useCallback, useState } from "react"

type UseCanvas = {
    (ops: {draw?: (ctx: CanvasRenderingContext2D)    => void, contextType: '2d'             }) : {ref: (canvas: HTMLCanvasElement | null) => void, ctx: CanvasRenderingContext2D    | null, element: HTMLCanvasElement | null};
    (ops: {draw?: (ctx: WebGLRenderingContext)       => void, contextType: 'webgl'          }) : {ref: (canvas: HTMLCanvasElement | null) => void, ctx: WebGLRenderingContext       | null, element: HTMLCanvasElement | null};
    (ops: {draw?: (ctx: WebGL2RenderingContext)      => void, contextType: 'webgl2'         }) : {ref: (canvas: HTMLCanvasElement | null) => void, ctx: WebGL2RenderingContext      | null, element: HTMLCanvasElement | null};
    (ops: {draw?: (ctx: GPUCanvasContext)            => void, contextType: 'webgpu'         }) : {ref: (canvas: HTMLCanvasElement | null) => void, ctx: GPUCanvasContext            | null, element: HTMLCanvasElement | null};
    (ops: {draw?: (ctx: ImageBitmapRenderingContext) => void, contextType: 'bitmaprenderer' }) : {ref: (canvas: HTMLCanvasElement | null) => void, ctx: ImageBitmapRenderingContext | null, element: HTMLCanvasElement | null};
}

interface ContextMap {
    '2d': CanvasRenderingContext2D;
    'webgl': WebGLRenderingContext;
    'webgl2': WebGL2RenderingContext;
    'webgpu': GPUCanvasContext;
    'bitmaprenderer': ImageBitmapRenderingContext;
}

type CanvasContextType = keyof ContextMap;

// might ditch the draw prop, it's maybe useful in the not hook style, but I either draw things with the context directly or I need to pass in a dependency array to know when to call draw again...
// the dependency array might be the way to go, I'll need to try it out to see if it still makes sense that way, does nothing currently
export const useCanvas = (<T extends CanvasContextType>({draw, contextType = '2d' as T}: { draw?: (ctx: ContextMap[T]) => void, contextType?: T }) : { ref: (canvas:HTMLCanvasElement | null) => void, ctx: ContextMap[CanvasContextType] | null, element: HTMLCanvasElement | null} => {
    const [ctx, setContext] = useState<ContextMap[CanvasContextType]| null>(null)
    const [element, setElement] = useState<HTMLCanvasElement | null>(null)
    const ref = useCallback((canvas: HTMLCanvasElement | null) => {
        setElement(canvas)
        if (canvas) {
            setContext(canvas.getContext(contextType) as ContextMap[CanvasContextType] | null)
        } else {
            setContext(null)
        }
    }, [contextType])
    
    return { ref, ctx, element }
}) as UseCanvas;