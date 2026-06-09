'use client'
import { notafucation, notatoast } from 'nota-fucation'
// import toastCSS from 'nota-fucation/toast.css' with { type: 'css' }
// can't import this way because of how turbopack bundles css, maybe making it a '*.module.css' would be correct
// for that convention, but I'm not using it in any of the ways CSS Build modules are designed to be used but
// rather the way Vanilla CSS imports work, module CSS gives me something I'd still have to convert afterwards
import { useEffect } from "react"

export default function Notafucation() {
    useEffect(() => {
        if ('customElements' in globalThis) {
            // I hate this, but I was spending too long trying to figure out why the package
            // wasn't including the stylesheets but all the code was working and this works
            // for now, especially on a broken project like this is... since I also make the
            // nota-fucation project I will try to figure out a more elegant solution later,
            // realistically I would want to override any styles to fit this apps design
            // anyway so even if turbopack or webpack won't allow the css export that only
            // matters when the user hasn't included their own overrides yet so it's ugly now
            // but only because I haven't gotten to the styling I want to do yet
            const backuptoastsheet = new CSSStyleSheet()
            backuptoastsheet.replace(`
:host {
    interpolate-size: allow-keywords;
    font-family: sans-serif;
    font-weight: normal;

    display: flex;
    align-items: center;
    padding: .5em;
    padding-right: 2em;
    min-width: 100px;
    max-width: 20em;
    overflow: hidden;
    background-color: #2257eb;
    color: #fff;
    corner-shape: bevel;
    border-radius: 0 .5em;
    margin-top: 9px;
    height: auto;
    transition: height .2s, margin-top .2s;
    box-shadow: 5px 2px 3px black;

    @starting-style {
        height: 0;
        margin-top: 0px;
    }

    #notaClose {
        border: none;
        padding: 0;
        overflow: hidden;
        background: #fff5;
        color: white;
        corner-shape: bevel;
        border-radius: 0 .5em;
        width: 1.5em;
        height: 1.5em;
        &::before {
            display: block;
            content: url("data:image/svg+xml;utf8,<svg width='100%' height='100%' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'><path d='M4.795 3.912l-.883.883.147.146L7.117 8 4.06 11.059l-.147.146.883.883.146-.147L8 8.883l3.059 3.058.146.147.883-.883-.147-.146L8.883 8l3.058-3.059.147-.146-.883-.883-.146.147L8 7.117 4.941 4.06z' style='line-height:normal;font-variant-ligatures:normal;font-variant-position:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-alternates:normal;font-feature-settings:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-transform:none;text-orientation:mixed;shape-padding:0;isolation:auto;mix-blend-mode:normal' fill='currentColor' fill-rule='evenodd' /></svg>") / "close";
        }
    }
    > progress {
        border: none;
        height: .5em;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;

        &::-webkit-progress-bar {
            background: transparent;
        }

        &::-webkit-progress-value {
            background: var(--nota-default-progress-color, rgb(190, 186, 106));
            transform: skewX(45deg) translateX(.25em);
        }
        &::-moz-progress-bar {
            background: var(--nota-default-progress-color, rgb(190, 186, 106));
            transform: skewX(45deg) translateX(.25em);
        }
    }
}

/* Begin Default Nota-Class Styles */
:host(.danger),
:host(.error) {
    background-color: var(--nota-danger-background-color, #ff815e);
}

:host(.failure) {
    background-color: var(--nota-failure-background-color, red);
    color: var(--nota-failure-color, revert-rule);
    text-shadow: 1px 1px 1px black;
    font-weight: bold;
}


:host(.warn) {
    background-color: orange;
    color: #333;
    font-weight: bold;
    &::before {
        display: inline;
        min-height: 1.5em;
        min-width: 1.5em;
        content: url("data:image/svg+xml;utf8,<svg width='100%' height='100%' viewBox='0 0 512 512' fill='%23000000' version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve'><path d='M509.769,480.665L275.102,11.331c-7.253-14.464-30.933-14.464-38.187,0L2.249,480.665 c-3.307,6.613-2.944,14.464,0.939,20.757c3.904,6.272,10.752,10.112,18.155,10.112h469.333c7.403,0,14.251-3.84,18.155-10.112 C512.713,495.129,513.075,487.278,509.769,480.665z M256.009,426.201c-11.776,0-21.333-9.557-21.333-21.333 s9.557-21.333,21.333-21.333s21.333,9.557,21.333,21.333S267.785,426.201,256.009,426.201z M277.342,340.867 c0,11.776-9.536,21.333-21.333,21.333c-11.797,0-21.333-9.557-21.333-21.333V191.534c0-11.776,9.536-21.333,21.333-21.333 c11.797,0,21.333,9.557,21.333,21.333V340.867z' /></svg>") / "alert icon";
        margin-right: .5em;
    }
}

:host(.warn) progress::-webkit-progress-value {
    background: yellow;
}

:host(.warn) progress::-moz-progress-bar {
    background: yellow;
}

:host(.success) {
    background-color: #8dbf58;
}

:host(.info) {
    background-color: cyan;
    color: black;
    font-weight: bold;
    progress {
        opacity: .3;
    }
}

:host(.info) progress::-webkit-progress-value {
    background: black;
}

:host(.info) progress::-moz-progress-bar {
    background: black;
}
`);
            notafucation()
            notatoast(backuptoastsheet)
        }
    }, [])
    return <nota-fucation></nota-fucation>
}