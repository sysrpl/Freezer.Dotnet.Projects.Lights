let switchEffects: Proc;

function initEffects() {
    let currentColor: HTMLElement;

    function effectClick(e: Event) {
        if (currentColor)
            currentColor.classList.remove("selected");
        currentColor = null;
        let t = e.currentTarget as HTMLElement;
        let s = t.innerText;
        s = s.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (s == "randomshuffle") {
            let items = getAll("#effects i.fa-square-check");
            if (items.length == 0)
                items = getAll("#effects i.fa-square");
            if (items.length == 0)
                return;
            let group: string[] = [];
            for (let i of items) {
                s = i.parentElement.innerText;
                s = s.toLowerCase().replace(/[^a-z0-9]/g, "");
                group.push(s);
            }
            s = group.join(",");
            fetchPost("/?action=effects-set-shuffe", `items=${s}`);
        }
        else
            fetch(`/?action=effects-set-effect&effect=${s}`);
    }

    function effectChecked(e: Event) {
        let t = e.currentTarget as HTMLElement;
        if (t.classList.contains("fa-square")) {
            t.classList.remove("fa-square");
            t.classList.add("fa-square-check");
        }
        else {
            t.classList.remove("fa-square-check");
            t.classList.add("fa-square");
        }
        e.stopPropagation();
        let selected = get("#effects .selected");
        if (isUndefined(selected))
            return;
        if (selected.innerText != "Random Shuffle")
            return;
        let items = getAll("#effects i.fa-square-check");
        if (items.length == 0)
            items = getAll("#effects i.fa-square");
        if (items.length == 0)
            return;
        let s: string;
        let group: string[] = [];
        for (let i of items) {
            s = i.parentElement.innerText;
            s = s.toLowerCase().replace(/[^a-z0-9]/g, "");
            group.push(s);
        }
        s = group.join(",");
        fetchPost("/?action=effects-set-shuffe", `items=${s}`);
    }

    getAll("#effects > div").forEach(
        item => item.addEventListener("click", effectClick));

    getAll("#effects > div > i").forEach(
        item => item.addEventListener("click", effectChecked));

    function colorClick(e: MouseEvent) {
        if (ScrollArea.current.active)
            return;
        let t = e.currentTarget as HTMLElement;
        if (currentColor == t)
            return;
        if (currentColor)
            currentColor.classList.remove("selected");
        currentColor = t;
        currentColor.classList.add("selected");
        getAll("#effects.lines>div").forEach(i => i.classList.remove("selected"));
        let s = currentColor.classList[0].replace("color", "");
        fetch(`/?action=effects-set-color&color=${s}`);
    }

    let colors = getAll("#effects #colors div");
    colors.forEach(i => {
        let s = i.className;
        i.style.background = s.replace("color", "#");
        i.addEventListener("click", colorClick);
    });

    switchEffects = function () {
    }
}