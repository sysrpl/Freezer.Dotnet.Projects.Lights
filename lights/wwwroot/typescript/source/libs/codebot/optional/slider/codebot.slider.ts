/// <reference path="../../codebot.ts" />

enum SliderOrientation {
    Horizontal,
    Vertical
}

class Slider {
    private _slider: HTMLElement;
    private _knob: HTMLElement;
    private _associate: HTMLElement | null;
    private _position: number;
    private _min: number;
    private _max: number;
    private _step: number;
    private _offset: number;
    private _orientation: SliderOrientation;
    private _inverted: boolean;
    private _timer: number;

    onchange: Action<Slider> | null;
    onsubmit: Action<Slider> | null;

    public update() {
        if (this._associate)
            this._associate.innerText = this._position.toString();
        if (this._orientation == SliderOrientation.Horizontal) {
            let width = this._slider.getBoundingClientRect().width - this._offset - 2;
            let range = this._max - this._min;
            let percent = (this._position - this.min) / range;
            if (this._inverted)
                percent = 1 - percent;
            this._knob.style.left = (width * percent).toString() + "px";
        }
        else {
            let height = this._slider.getBoundingClientRect().height - this._offset - 2;
            let range = this._max - this._min;
            let percent = (this._position - this.min) / range;
            if (this._inverted)
                percent = 1 - percent;
            this._knob.style.top = (height * percent).toString() + "px";
        }
    }

    private handleSubmit() {
        this._timer = 0;
        if (this.onsubmit)
            this.onsubmit(this);
    }

    get position(): number {
        return this._position;
    }

    set position(value: number) {
        this.move(value);
        if (this.onchange)
            this.onchange(this);
        if (this._timer)
            clearTimeout(this._timer);
        this._timer = 0;
        if (this.onsubmit)
            this._timer = setTimeout(this.handleSubmit.bind(this), 250);
    }

    /** Move to a position directly without firing events
     * @param p The new position to set.
     */
    public move(p: number) {
        if (p < this._min)
            p = this._min;
        else if (p > this._max)
            p = this._max;
        let r = 1 / this._step;
        p = Math.round(p * r) / r;
        this._position = p;
        this.update();
    }

    get step(): number {
        return this._step;
    }

    set step(value: number) {
        if (value < 0.0001)
            value = 0.0001;
        this._step = value;
        this.position = this._position;
    }

    get min(): number {
        return this._min;
    }

    set min(value: number) {
        this._min = value;
        if (this._position < this._min)
            this._position = this._min;
        this.update();
    }

    get max(): number {
        return this._max;
    }

    set max(value: number) {
        this._max = value;
        if (this._position > this._max)
            this._position = this._max;
    }

    get offset(): number {
        return this._offset;
    }

    set offset(value: number) {
        this._offset = value;
    }

    get orientation(): SliderOrientation {
        return this._orientation;
    }

    set orientation(value: SliderOrientation) {
        this._orientation = value;
        this.update();
    }

    get inverted(): boolean {
        return this._inverted;
    }

    set inverted(value: boolean) {
        this._inverted = value;
    }

    get doc(): any {
        return document as any;
    }

    constructor(slider: string, associate?: string) {
        let knob = document.createElement("div");
        knob.classList.add("knob");
        this._slider = get(slider);
        this._slider.appendChild(knob);
        this._slider["slider"] = this;
        this._knob = knob;
        this._associate = associate ? get(associate) : null;
        this._position = 0;
        this._min = 0;
        this._max = 100;
        this._step = 1;
        this._offset = 26;
        this._orientation = SliderOrientation.Horizontal;
        this._inverted = false;
        this._timer = 0;
        this.onchange = null;
        this.onsubmit = null;

        window.addEventListener("resize", () => this.move(this._position));

        function sliderMouseMove(e: FingerEvent, s: Slider) {
            let rect = s._slider.getBoundingClientRect();
            let pos = getFingerPos(e);
            if (s._orientation == SliderOrientation.Horizontal) {
                let x = pos.clientX - rect.left;
                if (x < 0)
                    x = 0;
                else if (x > rect.width)
                    x = 1;
                else
                    x = x / rect.width;
                if (s._inverted)
                    x = 1 - x;
                let range = s._max - s._min;
                s.position = range * x + s._min;
            }
            else {
                let y = pos.clientY - rect.top;
                if (y < 0)
                    y = 0;
                else if (y > rect.height)
                    y = 1;
                else
                    y = y / rect.height;
                if (s._inverted)
                    y = 1 - y;
                let range = s._max - s._min;
                s.position = range * y + s._min;
            }
        }

        function sliderMouseUp(e: FingerEvent, s: Slider) {
            if (isMouseEvent(e)) {
                if (e.button == 0) {
                    s._knob.removeClass("pressed");
                    (document as any)._slider = null;
                }

            } else {
                s._knob.removeClass("pressed");
                (document as any)._slider = null;
            }
        }

        if (hasTouchSupport()) {
            this._slider.addEventListener("touchstart", e => {
                document["_slider"] = this;
                this._knob.addClass("pressed");
                sliderMouseMove(e, this);
                e.stopPropagation();
            });

            if (isUndefined(window["_slider"])) {
                window["_slider"] = true;
                document.addEventListener("touchmove", e => {
                    if (document["_slider"]) {
                        let s: Slider = document["_slider"];
                        sliderMouseMove(e, s);
                    }
                });
                document.addEventListener("touchend", e => {
                    if (document["_slider"]) {
                        let s: Slider = document["_slider"];
                        sliderMouseUp(e, s);
                    }
                });
            }
        }
        else {
            this._slider.addEventListener("mousedown", e => {
                document["_slider"] = this;
                this._knob.addClass("pressed");
                sliderMouseMove(e, this);
                e.stopPropagation();
            });

            if (isUndefined(window["_slider"])) {
                window["_slider"] = true;
                document.addEventListener("mousemove", e => {
                    if (document["_slider"]) {
                        let s: Slider = document["_slider"];
                        sliderMouseMove(e, s);
                    }
                });
                document.addEventListener("mouseup", e => {
                    if (document["_slider"]) {
                        let s: Slider = document["_slider"];
                        sliderMouseUp(e, s);
                    }
                });
            }

        }
        setTimeout(this.update.bind(this), 10);
    }
}