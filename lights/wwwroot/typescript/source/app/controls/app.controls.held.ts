class Held {
    private _current: HTMLElement = null;
    private _pressTimer: number = 0;
    private _startX: number = 0;
    private _startY: number = 0;
    private _count: number = 0;

    // Triple-tap tracking
    private _tapCount: number = 0;
    private _lastTapElement: HTMLElement = null;
    private _lastTapTime: number = 0;
    private _tapTimeout: number = 0;
    private readonly TAP_THRESHOLD_MS = 750; // Max time between taps

    public onheld: Action<Held>;
    public ontapped: Action<Held>;

    public get current(): HTMLElement {
        return this._current;
    }

    public wasHeld(e: HTMLElement): boolean {
        return e == this.current && this._current["heldCount"] == this._count;
    }

    private startPress(e: MouseEvent) {
        this.cancelPress();
        this._current = e.currentTarget as HTMLElement;
        let x = e.clientX;
        let y = e.clientY;
        this._startX = x;
        this._startY = y;
        this._pressTimer = setTimeout(() => {
            this._count++;
            let item = this._current;
            item["heldCount"] = this._count + 1;
            item.classList.add("flash");
            setTimeout(() => {
                item.classList.remove("flash");
            }, 2000);
            if (this.onheld)
                this.onheld(this);
        }, 2000);
    }

    private cancelPress() {
        this._count++;
        if (this._pressTimer)
            clearTimeout(this._pressTimer);
        this._pressTimer = 0;
    }

    private movePress(e: MouseEvent) {
        if (this._pressTimer == 0)
            return;
        let x = e.clientX;
        let y = e.clientY;
        if (Math.hypot(x - this._startX, y - this._startY) > 10)
            this.cancelPress();
    }

    private handlePointerUp(e: MouseEvent) {
        const element = this._current;

        this.cancelPress();

        if (!element) {
            this.resetTapTracking();
            return;
        }

        const now = Date.now();
        const timeSinceLastTap = now - this._lastTapTime;

        // Check if this is a continuation of taps on the same element
        if (element === this._lastTapElement && timeSinceLastTap < this.TAP_THRESHOLD_MS) {
            this._tapCount++;
        } else {
            // New tap sequence
            this._tapCount = 1;
        }

        this._lastTapElement = element;
        this._lastTapTime = now;

        // Clear existing timeout
        if (this._tapTimeout) {
            clearTimeout(this._tapTimeout);
        }

        // Check if we have a triple tap
        if (this._tapCount === 3) {
            this.triggerTripleTap(element);
            this.resetTapTracking();
        } else {
            // Set timeout to reset tap count if no more taps come
            this._tapTimeout = setTimeout(() => {
                this.resetTapTracking();
            }, this.TAP_THRESHOLD_MS);
        }
    }

    private triggerTripleTap(element: HTMLElement) {
        this._current = element;
        this._count++;
        element["heldCount"] = this._count + 1;
        element.classList.add("flash");
        setTimeout(() => {
            element.classList.remove("flash");
        }, 2000);
        if (this.ontapped) {
            this.ontapped(this);
        }
    }

    private resetTapTracking() {
        this._tapCount = 0;
        this._lastTapElement = null;
        this._lastTapTime = 0;
        if (this._tapTimeout) {
            clearTimeout(this._tapTimeout);
            this._tapTimeout = 0;
        }
    }

    constructor(...elements: HTMLElement[]) {
        let startPress = this.startPress.bind(this);
        let handlePointerUp = this.handlePointerUp.bind(this);
        let movePress = this.movePress.bind(this);

        for (let e of elements) {
            e.addEventListener("pointerdown", startPress);
        }
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointermove", movePress);
    }
}