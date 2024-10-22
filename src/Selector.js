// class Selector {
//     constructor(data, onChangeCallback) {

//         this.selector = document.createElement("select");
//         this.selector.classList.add("selector");

//         const options = Object.keys(data);

//         options.forEach(item => {
//             const option = document.createElement("option");
//             option.value = item;
//             option.textContent = item;

//             // if (initValue === item) {
//             //     option.selected = true;
//             // }

//             this.selector.appendChild(option);
//         });

//         this.selector.addEventListener("change", (event) => {
//            onChangeCallback(event.target.value, this.data);
//         });
//     }

//     getContainer() {
//         return this.selector;
//     }
    
//     addOption(option) {
//         const newOption = document.createElement("option");
//         newOption.value = option;
//         newOption.textContent = option;
//         this.selector.appendChild(newOption);
//     }

//     setValue(value) {
//         this.selector.value = value;
//     }
// }

// export default Selector;
// onabor

class Selector {
    constructor(data, onChangeCallback) {
        this.container = document.createElement("div");
        this.container.classList.add("custom-selector");

        this.button = document.createElement("button");
        this.button.textContent = "Select an option";
        this.button.classList.add("selector-button");
        this.container.appendChild(this.button);

        this.dropdown = document.createElement("div");
        this.dropdown.classList.add("custom-dropdown");
        this.container.appendChild(this.dropdown);

        this.optionsList = document.createElement("ul");
        this.dropdown.appendChild(this.optionsList);

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.placeholder = "Add new option";
        this.dropdown.appendChild(this.input);

        this.addButton = document.createElement("button");
        this.addButton.textContent = "Add";
        this.dropdown.appendChild(this.addButton);

        this.data = data;
        this.onChangeCallback = onChangeCallback;

        this.renderOptions();

        this.button.addEventListener("click", () => {
            this.dropdown.classList.toggle("show");
        });

        this.addButton.addEventListener("click", () => {
            const value = this.input.value.trim();
            if (value) {
                this.addOption(value);
                this.input.value = "";
            }
        });

        document.addEventListener("click", (event) => {
            if (!this.container.contains(event.target)) {
                this.dropdown.classList.remove("show");
            }
        });
    }

    renderOptions() {
        this.optionsList.innerHTML = "";
        Object.keys(this.data).forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "X";
            deleteButton.classList.add("delete-button");
            deleteButton.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent the click event from bubbling up to the li
                this.removeOption(item);
            });

            li.appendChild(deleteButton);
            li.addEventListener("click", () => {
                this.setValue(item);
                this.onChangeCallback(item, this.data);
                this.dropdown.classList.remove("show");
            });

            this.optionsList.appendChild(li);
        });
    }

    getContainer() {
        return this.container;
    }

    addOption(option) {
        this.data[option] = true; // Assuming data is an object with keys as options
        this.renderOptions();
    }

    removeOption(option) {
        delete this.data[option];
        this.renderOptions();
    }

    setValue(value) {
        this.button.textContent = value;
    }
}

export default Selector;