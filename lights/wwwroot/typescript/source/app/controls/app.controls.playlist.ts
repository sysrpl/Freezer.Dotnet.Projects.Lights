class PlayList {
    private static readonly cookie = "playlist";
    private static readonly count = 5;
    private _element: HTMLElement;
    private _items: HTMLElement[];
    private _index: number;
    private _cookie: string;

    onchange: Action<PlayList> | null;

    private itemClick(e: MouseEvent) {
        e.stopPropagation();
        let t = e.currentTarget as HTMLElement;
        let index = this._items.indexOf(t);
        if (index == this._index)
            return;
        this._index = index;
        for (let i of this._items)
            if (i == t)
                i.classList.add("selected");
            else
                i.classList.remove("selected");
        setCookie(this._cookie, this.index.toString(), 1000);
        if (this.onchange)
            this.onchange(this);
    }

    constructor(container: string, cookie: string) {
        let parent = get(container);
        this._element = document.createElement("div");
        this._element.id = "playlist";
        this._items = [];
        this._cookie = cookie;

        let click = this.itemClick.bind(this);

        for (let i = 0; i < PlayList.count; i++) {
            let c = document.createElement("div");
            c.className = "item";
            c.innerText = (i + 1).toString();
            c.addEventListener("click", click);
            this._element.appendChild(c);
            this._items.push(c);
        }
        parent.appendChild(this._element);
        let s = readCookie(this._cookie);
        let i = 0;
        if (s)
            i = parseInt(s);
        if (Number.isNaN(i))
            i = 0;
        if (i < 0)
            i = 0;
        else if (i > this._items.length - 1)
            i = this._items.length - 1;
        this.index = i;
    }

    public get index(): number { return this._index; }

    public set index(value: number) {
        if (value < 0)
            return;
        if (value > this._items.length - 1)
            return;
        this._index = value;
        for (let i = 0; i < this._items.length; i++) {
            let item = this._items[i];
            if (i == value)
                item.classList.add("selected");
            else
                item.classList.remove("selected");
        }
        setCookie(this._cookie, this.index.toString(), 1000);
        if (this.onchange)
            this.onchange(this);
    }
}