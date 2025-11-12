/// <reference path="../../codebot.ts" />

class Toggle {
    private _element: HTMLElement;
    private _enabled: boolean;
    public onchange: Action<Toggle> | null;

    public get enabled(): boolean {
        return this._enabled;
    }

    public get element(): HTMLElement {
        return this._element;
    }

    public set enabled(value: boolean) {
        this._enabled = value;
        if (this._enabled)
            this._element.classList.add("enabled");
    }

    constructor(toggle: string) {
        this._element = get(toggle);
        this._enabled = false;
        this.onchange = null;
        let knob = document.createElement("div");
        knob.classList.add("knob");
        this._element.appendChild(knob);
        let me = this;

        this._element.addEventListener("click", () => {
            me._enabled = !me.enabled;
            if (me._enabled)
                this._element.classList.add("enabled");
            else
                this._element.classList.remove("enabled");
            if (me.onchange != null)
                me.onchange(me);
        })
    }

}