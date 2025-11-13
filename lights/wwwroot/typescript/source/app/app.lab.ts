let switchLab: Proc;

function initLab() {
    let labCountSlider: Slider;
    let labIntensitySlider: Slider;

    let data: number[];
    let line = 0;
    let section = 0;
    let colors = ["red", "green", "blue", "yellow", "fuchsia", "teal"];

    get("#lab .button.pattern").addEventListener("click", () => fetch("/?action=lab-pattern"));
    get("#lab .button.off").addEventListener("click", () => fetch("/?action=lab-off"));

    labCountSlider = new Slider("#lab .vert div.slider");
    labCountSlider.orientation = SliderOrientation.Vertical;
    labCountSlider.min = 5;
    labCountSlider.max = 700;
    labCountSlider.step = 1;
    labCountSlider.inverted = true;
    labIntensitySlider = new Slider("#lab .intensity");
    labIntensitySlider.min = 0;
    labIntensitySlider.max = 100;
    labIntensitySlider.position = 50;
    labIntensitySlider.step = 0.1;

    let left = get("#lab i.button.left") as HTMLElement;
    let right = get("#lab i.button.right") as HTMLElement;

    function swap(dir: number) {
        let max = data.length;
        section += dir;
        if (section < 0)
            section = 0;
        if (section > max - 1)
            section = max - 1;
        left.style.display = section == 0 ? "none" : "block";
        left.style.background = colors[(section - 1) % colors.length]
        right.style.display = section == max - 1 ? "none" : "block";
        right.style.background = colors[(section + 1) % colors.length]
        labCountSlider.move(data[section]);
        let s = get("#lab .vert #counts") as HTMLDivElement;
        s.innerText = `${section} / ${labCountSlider.position}`;
        s = get("#lab .intensity") as HTMLDivElement;
        s.style.background = `linear-gradient(to right, black, ${colors[section % colors.length]} 50%, white)`;
        fetch(`/?action=lab-set-section&section=${section}`);
    }

    left.addEventListener("click", () => {
        swap(-1);
        fetch(`/?action=effects-set-effect&effect=test`);
    });
    right.addEventListener("click", () => {
        swap(1);
        fetch(`/?action=effects-set-effect&effect=test`);
    });

    function countChange() {
        if (data.length < 1)
            return;
        let count = labCountSlider.position;
        data[section] = count;
        let s = get("#lab .vert #counts") as HTMLDivElement;
        s.innerText = `${section} / ${count}`;
    }

    function countSubmit() {
        fetch(`/?action=lab-set-count&line=${line}&section=${section}&count=${data[section]}`);
        fetch(`/?action=effects-set-effect&effect=test`);
    }

    function intensitySubmit() {
        let intensity = labIntensitySlider.position / 100;
        fetch(`/?action=settings-set-intensity&intensity=${intensity}`);
    }

    labCountSlider.onchange = countChange;
    labCountSlider.onsubmit = countSubmit;
    labIntensitySlider.onsubmit = intensitySubmit;

    function plusMinusClick(e: Event) {
        let b = e.currentTarget as HTMLElement;
        let s = b.innerText;
        if (s.startsWith("+") || s.startsWith("-")) {
            labCountSlider.position += parseInt(s);
        }
    }

    for (let item of getAll("#lab .vert div"))
        item.addEventListener("click", plusMinusClick);

    let d0 = get("#d0") as HTMLElement;
    let d1 = get("#d1") as HTMLElement;

    function dataReceived(d: number[]) {
        section = 1;
        data = d;
        swap(-1);
    }

    function dataRead() {
        fetch(`/?action=lab-get-data&line=${line}`)
            .then((r) => r.json())
            .then((d) => dataReceived(d));
    }

    function dataChecked(e: Event) {
        let t = e.currentTarget as HTMLElement;
        if (t.get("i").classList.contains("fa-square-check"))
            return;
        d0.get("i").classList.remove("fa-square-check");
        d1.get("i").classList.remove("fa-square-check");
        d0.get("i").classList.add("fa-square");
        d1.get("i").classList.add("fa-square");
        let i = t == d0 ? 0 : 1;
        t = t.get("i");
        t.classList.remove("fa-square");
        t.classList.add("fa-square-check");
        if (i != line) {
            line = i;
            fetch(`/?action=lab-set-line&line=${line}`);
            fetch(`/?action=effects-set-effect&effect=test`);
            dataRead();
        }
    }

    for (let item of getAll("#lab .button.data"))
        item.addEventListener("click", dataChecked);

    dataRead();

    function intensityReceived(i: number[]) {
        labIntensitySlider.move(i[0] * 100);
    }

    switchLab = () => {
        fetchJson("/?action=settings-get-intensity", intensityReceived);
        labCountSlider.update();
        labIntensitySlider.update();
    };
}