class Selector {
    constructor(data, onChangeCallback, onAddCallback, onRemoveCallback) {
        this.data = data;
        this.onChangeCallback = onChangeCallback;
        this.onAddCallback = onAddCallback;
        this.onRemoveCallback = onRemoveCallback;

        this.container = document.createElement("div");
        this.container.classList.add("custom-selector");

        this.button = document.createElement("button");
        this.button.textContent = data['current'];
        this.button.classList.add("selector-button");
        this.button.classList.add("my-button");
        this.container.appendChild(this.button);

        this.dropdown = document.createElement("div");
        this.dropdown.classList.add("custom-dropdown");
        this.container.appendChild(this.dropdown);

        this.optionsList = document.createElement("ul");
        this.dropdown.appendChild(this.optionsList);

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.placeholder = "new preset name...";
        this.dropdown.appendChild(this.input);
        this.input.classList.add("dropdown-input");

        this.addButton = document.createElement("button");
        this.addButton.textContent = "Add";
        this.addButton.classList.add("dropdown-action-button");
        this.addButton.classList.add("my-other-button");
        this.dropdown.appendChild(this.addButton);

        this.addButton.addEventListener("click", () => {
            const value = this.input.value.trim();
            if (value) {
                this.addOption(value);
                this.onAddCallback(value);
                this.onChangeValue(value);
                this.input.value = "";
            }
        });

        this.renderOptions();

        this.button.addEventListener("click", () => {
            this.dropdown.classList.toggle("show");
        });

        document.addEventListener("click", (event) => {
            if (!this.container.contains(event.target)) {
                this.dropdown.classList.remove("show");
            }
        });
    }

    renderOptions() {
        this.optionsList.innerHTML = "";

        let item = 'default';
        const li = document.createElement("li");
        li.textContent = item;
        li.addEventListener("click", () => {
            this.onChangeValue(item);
        });

        this.optionsList.appendChild(li);

        Object.keys(this.data.presets).forEach(item => {

            if (item != 'default') {
                const li = document.createElement("li");
                li.textContent = item;
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "X";
                deleteButton.classList.add("dropdown-action-button");
                deleteButton.classList.add("my-other-button");
                deleteButton.addEventListener("click", (event) => {
                    event.stopPropagation();
                    this.removeOption(item);
                    this.onRemoveCallback(item, this.data);
                });
                li.appendChild(deleteButton);

                li.addEventListener("click", () => {
                    this.onChangeValue(item);
                });

                this.optionsList.appendChild(li);
            }
        });

        this.button.textContent = this.data['current'];
    }

    onChangeValue(item) {
        this.setValue(item);
        this.onChangeCallback(item, this.data);
        this.dropdown.classList.remove("show");
    }

    getContainer() {
        return this.container;
    }

    addOption() {
        this.renderOptions();
    }

    removeOption() {
        this.renderOptions();
    }

    setValue(value) {
        this.button.textContent = value;
    }
}

export default Selector;
