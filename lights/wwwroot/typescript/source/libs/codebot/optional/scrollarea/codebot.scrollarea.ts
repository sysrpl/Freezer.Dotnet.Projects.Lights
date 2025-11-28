/// <reference path="../../codebot.ts" />

class ScrollArea {
    private area: HTMLDivElement;
    private box: HTMLDivElement;
    private up: HTMLDivElement;
    private down: HTMLDivElement;
    private isDown = false;
    private startY = 0;
    private scrollTop = 0;
    private lastY = 0;
    private lastTime = 0;
    private velocity = 0;
    private momentumTimer = 0;
    private scrolling = false;

    private static _current : ScrollArea;

    public static get current(): ScrollArea {
        return ScrollArea._current;
    }

    constructor (area: string) {
        if (!ScrollArea._current)
            ScrollArea._current = this;
        this.area = document.querySelector(area);
        this.box = this.area.querySelector(".scrollbox");
        this.up = this.area.querySelector(".up");
        this.down = this.area.querySelector(".down");
        this.updateIcons();
        this.box.addEventListener('scroll', this.updateIcons);
        window.addEventListener('resize', this.updateIcons);
        window.setInterval(this.updateIcons, 500);
        this.box.addEventListener('mousedown', this.boxMouseDown);
        this.box.addEventListener('mouseup', this.boxMouseUp);
        window.addEventListener('mousemove', this.windowMouseMove);
    }

    public releaseCapture = () => {
        if (!this.isDown)
            return;
        this.isDown = false;
        this.scrolling = false;
        if (this.momentumTimer)
            clearInterval(this.momentumTimer);
        this.momentumTimer = 0;
    }

    private updateIcons = () => {
        const scrollable = this.box.scrollHeight > this.box.clientHeight + 2;
        if (!scrollable) {
            this.up.classList.add('hidden');
            this.down.classList.add('hidden');
            return;
        }
        let top = this.box.scrollTop <= 1;
        let bottom = this.box.scrollTop + this.box.clientHeight >= this.box.scrollHeight - 1;
        this.up.classList.toggle('hidden', top);
        this.down.classList.toggle('hidden', bottom);
    }

    private boxMouseDown = (e: MouseEvent) => {
        if (document["_slider"])
            return;
        if (this.momentumTimer)
            clearInterval(this.momentumTimer);
        let me = this;
        setTimeout(() => { me.scrolling = false; }, 100);
        this.momentumTimer = 0;
        this.isDown = true;
        this.startY = e.pageY - this.box.offsetTop;
        this.scrollTop = this.box.scrollTop;
        this.lastY = this.startY;
        this.lastTime = Date.now();
        this.velocity = 0;
        e.preventDefault();
    }

    private boxMouseUp = (e: MouseEvent) => {
        if (!this.isDown)
            return;
        if (this.momentumTimer)
            clearInterval(this.momentumTimer);
        this.isDown = false;
        const decay = 0.95;
        let me = this;

        function timer() {
            if (document["_slider"]) {
            }
            else
                me.box.scrollTop -= me.velocity;
            me.velocity *= decay;
            if (Math.abs(me.velocity) < 0.2) {
                clearInterval(me.momentumTimer);
                me.scrolling = false;
            }
        }

        this.momentumTimer = setInterval(timer, 16);
    }

    private windowMouseMove = (e: MouseEvent) => {
        if (!this.isDown)
            return;
        if (document["_slider"])
            return;
        console.log("move");
        const y = e.pageY - this.box.offsetTop;
        const now = Date.now();
        const dy = y - this.lastY;
        const dt = now - this.lastTime;
        if (dt > 0)
            this.velocity = dy / dt * 20;
        this.lastY = y;
        this.lastTime = now;
        let prior = this.box.scrollTop;
        let next = this.scrollTop - (y - this.startY);
        this.box.scrollTop = this.scrollTop - (y - this.startY);
        if (Math.abs(prior - next) > 5)
            this.scrolling = true;
        e.preventDefault();
    }

    public scollTop() { this.box.scrollTop = 0; }
    public get active(): boolean { return this.scrolling }
}
