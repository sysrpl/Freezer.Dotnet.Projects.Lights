class GroupBox {
    private _box: HTMLElement;
    private _expanded: boolean;
    private _cookie: string;

    constructor(box: string, cookie: string) {
        this._box = get(box);
        this._expanded = true;
        this._cookie = cookie;
        if (getCookie(cookie) == "hidden")
            this.expanded = false;
        let toggleExpand = (e: MouseEvent) => this.expanded = !this.expanded;
        this._box.addEventListener("click", toggleExpand);
    }

    public get expanded(): boolean {
        return this._expanded;
    }

    public set expanded(value: boolean) {
        setCookie(this._cookie, value ? "shown" : "hidden", 1000);
        this._expanded = value;
        let c = this._box;
        let chevron = c.get("i");
        if (value) {
            chevron.classList.remove("fa-chevron-right");
            chevron.classList.add("fa-chevron-down");
        }
        else {
            chevron.classList.remove("fa-chevron-down");
            chevron.classList.add("fa-chevron-right");
        }
        while (true) {
            c = c.nextElementSibling as HTMLElement;
            if (c == null)
                break;
            if (!c.classList.contains("child"))
                break;
            c.style.display = value ? "" : "none";
            let s = c.get(".slider");
            if (s) {
                let slider = s["slider"] as Slider;
                slider.move(slider.position);
            }
        }
    }
}