import autocomplete, {AutocompleteItem, EventTrigger} from "autocompleter";

export function searchableGrid(inputEl: HTMLInputElement, containerEl: HTMLDivElement, fetch: (text: string, type: string)=>any[], gridItemRenderer: (item: any)=>HTMLDivElement, ){
    let gridContainer = document.createElement("div");
    containerEl.appendChild(gridContainer);
    gridContainer.style.display = "flex";
    gridContainer.style.flexDirection = "row"
    gridContainer.style.flexWrap = "wrap"
    gridContainer.style.justifyContent = "space-between";
    gridContainer.style.alignItems = "flex-start";
    gridContainer.style.alignContent = "flex-start";

    let onChange = (text: string, isSelect = false)=>{
        // clear grid
        while (gridContainer.firstChild){
            gridContainer.removeChild(gridContainer.firstChild);
        }

        let items = fetch(text, "element");

        for (const item of items) {
            let itemEl = gridItemRenderer(item);
            gridContainer.appendChild(itemEl);
        }

    }
    autocomplete({
        input: inputEl,
        emptyMsg: "",
        minLength: 1,
        showOnFocus: true,
        preventSubmit: true,
        fetch<T>(text: string, update: <T>(items: (T[] | false)) => void, trigger: EventTrigger): void {
            update(fetch(text, "tag"));
            onChange(inputEl.value);
        },
        onSelect<T>(item: { label: string }, input: HTMLInputElement): void {
            inputEl.value = item.label;
            onChange(inputEl.value, true);
        },
        render<T>(item: { label: string }, currentValue: string): HTMLDivElement | undefined {
            const itemElement = document.createElement("div");
            itemElement.textContent = item.label;
            itemElement.classList.add('autocompleteItem')
            // itemElement.style.background = "white";
            return itemElement;
        },
        customize(input: HTMLInputElement, inputRect: ClientRect | DOMRect, container: HTMLDivElement, maxHeight: number): void {
            container.classList.add('autocompleteContainer');
            console.log(container);
        }

    });
    onChange(inputEl.value);
}

//
// const list = [
//     {name: "palash", img: "image.png"},
//     {name: "palash", img: "image.png"},
// ]
// searchableGrid(
//     document.getElementById("inputText") as HTMLInputElement,
//     document.getElementById("gridContainer") as HTMLDivElement,
//     (text, type) => {
//         return list.filter(value => value.name.includes(text)).map(value => ({label: value.name}));
//     },
//     item => {
//         const itemElement = document.createElement("div");
//         itemElement.classList.add("gridItem");
//         itemElement.style.background = item.img;
//         return itemElement;
//     }
// )