   
if ('customElements' in globalThis && !customElements.get('nota-color-picker') && 'CSSStyleSheet' in globalThis) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`
        :host { 
            display: inline-block; 
            width: 48px; 
            height: 48px;
            margin: .2em .2em;

            .swatch { 
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border-radius: 50%; 
                border: 2px solid #e2e8f0;
                cursor: pointer;
                display: block;
            }

            & > dialog {
                position-area: left;
                border: none;
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            & > dialog::backdrop { background: rgba(0, 0, 0, 0.4); }

            .gradient-pad {
                width: 256px; height: 150px; position: relative; cursor: crosshair; border-radius: 4px;
                background-image: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);
            }
            .gradient-pad::after {
                content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background-image: linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,1) 100%);
            }
        }
        /* Expose the host focus ring for accessible keyboard tabs */
        :host(:focus-within) .swatch {
            outline: 3px solid #3b82f6;
            outline-offset: 2px;
        }
        /* Natively style the disabled layout cleanly */
        :host([disabled]) {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }
    `);

    /**
     * @extends HTMLElement
     * @implements FormAssociatedControl
     */
    class ColorPicker extends HTMLElement {
        static formAssociated = true;
        
        #shadow
        #swatch
        #dialog
        #pad
        #internals
        #currentH = 240
        #currentL = 50
        #hasBeenInteracted = false // Tracks if user has picked a color yet

        static get observedAttributes() {
            return ['value', 'name', 'disabled', 'required'];
        }

        constructor() {
            super()
            this.#internals = this.attachInternals();
            
            this.#shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
            this.#shadow.adoptedStyleSheets = [sheet];

            this.#swatch = document.createElement('button');
            this.#swatch.className = 'swatch';
            this.#swatch.setAttribute('part', 'swatch');
            this.#swatch.setAttribute('popoverTarget', 'DId')
            this.#swatch.setAttribute('tabindex', '0');

            this.#dialog = document.createElement('dialog');
            this.#dialog.setAttribute('id', 'DId')
            this.#dialog.setAttribute('popover', 'auto')
            this.#pad = document.createElement('div');
            this.#pad.className = 'gradient-pad';
            this.#pad.setAttribute('part', 'container');

            this.#dialog.append(this.#pad);
            this.#shadow.append(this.#swatch, this.#dialog);
        }

        connectedCallback() {
            // Handle spacebar / enter keypresses when keyboard focusing the element
            this.#shadow.addEventListener('keydown', this.#rootKeyDownHandler);

            this.#pad.addEventListener('click', this.#padClickHandler);
            this.#dialog.addEventListener('click', this.#dialogClickHandler);
            // this.#swatch.addEventListener('click', this.#swatchClickHandler);
        }

        disconnectedCallback() {
            this.#shadow.removeEventListener('keyDown', this.#rootKeyDownHandler)

            this.#pad.removeEventListener('click', this.#padClickHandler)
            this.#dialog.removeEventListener('click', this.#dialogClickHandler)
            this.#swatch.removeEventListener('click', this.#swatchClickHandler)
        }

        attributeChangedCallback(name: string, oldValue, newValue) {
            if (oldValue === newValue) return;

            if (name === 'value' && newValue !== this.value) {
                this.value = newValue;
            } else if (name === 'disabled') {
                this.disabled = newValue !== null;
            } else if (name === 'required') {
                this.#validate();
            }
        }

        // Hook into browser form events when fields get disabled globally by a <fieldset>
        formDisabledCallback(disabled) {
            this.disabled = disabled;
        }

        // --- EventHandlers ---
        #rootKeyDownHandler = (e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !this.disabled) {
                e.preventDefault();
                this.#dialog.showPopover();
            }
        }

        #padClickHandler = (e) => {
            const rect = this.#pad.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

            this.#currentH = Math.round(x * 360);
            this.#currentL = Math.round((1 - y) * 100);
            this.#hasBeenInteracted = true;

            this.value = this.#hslToHex(this.#currentH, 100, this.#currentL);
            
            this.#dialog.hidePopover();
            this.dispatchEvent(new Event('change', { bubbles: true }));
            this.#validate(); // Recalculate validation on selection change
        }

        #dialogClickHandler = (e) => { if (e.target === this.#dialog) this.#dialog.close(); }

        #swatchClickHandler = (e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!this.disabled) this.#dialog.showPopover({source: this.#swatch});
        }

        // --- Core Validation Runner ---
        #validate() {
            // If required, verify the user didn't leave it untouched (or implement custom validation color ranges here!)
            if (this.required && !this.#hasBeenInteracted) {
                this.#internals.setValidity(
                { valueMissing: true }, 
                'Please select a custom color theme.', 
                this.#swatch
                );
            } else {
                this.#internals.setValidity({}); // Passes validation completely
            }
        }

        // --- Getters & Setters ---
        get value() {
            return this.#hslToHex(this.#currentH, 100, this.#currentL);
        }

        set value(hexString) {
            if (!hexString || !hexString.startsWith('#')) return;
            
            this.#swatch.style.backgroundColor = hexString;
            
            // Only send values to the form if the input isn't disabled
            if (this.disabled) {
                this.#internals.setFormValue(null);
            } else {
                this.#internals.setFormValue(hexString);
            }
            
            const [h, , l] = this.#hexToHsl(hexString);
            this.#currentH = h;
            this.#currentL = l;

            if (this.getAttribute('value') !== hexString) {
                this.setAttribute('value', hexString);
            }
            this.#validate();
        }

        get disabled() { return this.hasAttribute('disabled'); }
        set disabled(val) {
            if (val) {
                this.setAttribute('disabled', '');
                this.removeAttribute('tabindex'); // Stop keyboard focus entirely when disabled
                this.#internals.setFormValue(null); // Clear form footprint
            } else {
                this.removeAttribute('disabled');
                this.setAttribute('tabindex', '0');
                this.#internals.setFormValue(this.value);
            }
            this.#validate();
        }

        get required() { return this.hasAttribute('required'); }
        set required(val) {
            if (val) this.setAttribute('required', '');
            else this.removeAttribute('required');
            this.#validate();
        }

        get form() { return this.#internals.form; }
        get name() { return this.getAttribute('name'); }
        set name(val) { this.setAttribute('name', val); }
        get type() { return 'color-picker'; }
        get validity() { return this.#internals.validity; }
        get validationMessage() { return this.#internals.validationMessage; }
        get checkValidity() { return () => this.#internals.checkValidity(); }
        get reportValidity() { return () => this.#internals.reportValidity(); }

        // --- Alternate Dynamic Formats ---
        get asRGB() {
            const [r, g, b] = this.#hexToRgb(this.value);
            return `rgb(${r}, ${g}, ${b})`;
        }
        get asHSL() { return `hsl(${this.#currentH}, 100%, ${this.#currentL}%)`; }
        get asArray() { return this.#hexToRgb(this.value); }

        // --- Conversions ---
        #hslToHex(h, s, l) {
            l /= 100;
            const a = (s * Math.min(l, 1 - l)) / 100;
            const f = n => {
                const k = (n + h / 30) % 12;
                const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, '0');
            };
            return `#${f(0)}${f(8)}${f(4)}`;
        }

        #hexToRgb(hex) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b];
        }

        #hexToHsl(hex) {
            let [r, g, b] = this.#hexToRgb(hex);
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, l = (max + min) / 2;
            if (max === min) h = 0;
            else {
                const d = max - min;
                switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return [Math.round(h * 360), 100, Math.round(l * 100)];
        }
    }
    customElements.define('nota-color-picker', ColorPicker);
}