class Selector {
    constructor(options, initValue, onChangeCallback) {

        this.selector = document.createElement("select");
        this.selector.classList.add("selector");
        options.forEach(item => {
            const option = document.createElement("option");
            option.value = item;
            option.textContent = item;

            if (initValue === item) {
                option.selected = true;
            }

            this.selector.appendChild(option);
        });

        this.selector.addEventListener("change", (event) => {
           onChangeCallback(event.target.value, this.data);
        });
    }

    getContainer() {
        return this.selector;
    }
    
    addOption(option) {
        const newOption = document.createElement("option");
        newOption.value = option;
        newOption.textContent = option;
        this.selector.appendChild(newOption);
    }
}

export default Selector;