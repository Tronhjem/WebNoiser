class IconButton extends HTMLElement {

    constructor() {
        super();

        // Create shadow DOM for encapsulation
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {

    }

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() {
        this.removeEventListener();
    }

    render() {
        this.shadowRoot.innerHTML = `     
            <style>
                :host {
                    display: inline-block;
                }
                p {
                    color: white;
                }
            </style>
            <div>
                <p>This is a test</p>
                <p>This is a test</p>
                <p>This is a test</p>
            </div>
        `
    }
}

// Register the custom element
customElements.define('icon-button', IconButton);

// Export for use in modules
export { IconButton };
