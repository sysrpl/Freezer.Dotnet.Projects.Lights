let switchPaint: Proc;

function initPaint() {

    const inchx = 185.38;
    const inchy = 23.5;

    let counter = 0;

    let source = get("#paintbox");
    let dest = get("#paint .outline");

    class Coord {
        constructor(public x: number = 0, public y: number = 0) { }

        public scale(s: number = 0) {
            return new Coord(this.x * s, this.y * s)
        }

        public distance(x: number, y: number): number {
            x = x - this.x;
            y = y - this.y;
            return Math.sqrt(x * x + y * y);
        }

        public distanceTo(c: Coord): number {
            let x = c.x - this.x;
            let y = c.y - this.y;
            return Math.sqrt(x * x + y * y);
        }

        public get valid(): boolean {
            const m = 5;
            return this.x > -m && this.x < inchx + m && this.y > -m && this.y < inchy + m;
        }
    }

    function translateCoords(x: number, y: number): Coord {
        let rectA = source.getBoundingClientRect();
        let rectB = dest.getBoundingClientRect();
        y = y - (rectB.top - rectA.top);
        x = x - (rectB.left - rectA.left);
        if (innerWidth > innerHeight) {
            let scale = 2908 / 372;
            scale = scale * rectB.height / rectB.width;
            x = x / rectB.width;
            y = y / rectB.height;
            y = (y - 0.5) / 0.5;
            y = 1 - (1 + y * scale) / 2;
        }
        else {
            let scale = 370 / 2906;
            scale = scale * rectB.height / rectB.width;
            x = x / rectB.width;
            y = y / rectB.height;
            x = (x - 0.5) / 0.5;
            x = (1 + x / scale) / 2;
            let z = x;
            x = y;
            y = z;
        }
        return new Coord(x * inchx, y * inchy);
    }

    let paint: Paint;

    class TouchPoint {
        timestamp: number = Date.now();
        count: number = 0;

        constructor(public x: number, public y: number, public hue: number, public down: boolean) { }
    }

    class Paint {
        private points: TouchPoint[] = [];
        private last: Coord = new Coord(10000, 10000);

        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        pressed: boolean = false;
        count: number = 0;

        constructor() {
            this.canvas = get('#paintbox') as HTMLCanvasElement;
            this.ctx = this.canvas.getContext('2d')!;
        }

        clear() {
            this.points = [];
            this.ctx.fillStyle = 'black';
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.last = new Coord(10000, 10000);
        }

        drawHues() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = 4;

            this.ctx.beginPath();
            for (let i = 0; i < this.points.length; i++) {
                if (this.points[i].down)
                    continue;
                const time = Date.now() - this.points[i].timestamp;
                if (time > 1000) {
                    continue;
                }
                let width = 50 - time / 1000 * 50;
                if (width < 2)
                    continue;

                const dx = this.points[i].x - this.points[i - 1].x;
                const dy = this.points[i].y - this.points[i - 1].y;
                this.ctx.beginPath();
                this.ctx.moveTo(this.points[i].x, this.points[i].y);
                this.ctx.lineTo(this.points[i - 1].x, this.points[i - 1].y);
                this.ctx.strokeStyle = `hsl(${this.points[i].hue}, 100%, 50%)`;
                this.ctx.lineWidth = width;
                this.ctx.stroke();
            }
            // Remove points older than 4 seconds
            const now = Date.now();
            this.points = this.points.filter(point => now - point.timestamp < 4000);
            if (this.points.length > 0 && !this.animated) {
                this.animated = true;
                requestAnimationFrame(animatePaint);
            } if (this.points.length == 0 && this.animated) {
                this.animated = false;
            }
        }

        addLine(x: number, y: number, down: boolean) {
            this.count++;
            let h = paintHueSlider.position / 100 * 360;
            if (h == 0)
                h = this.count % 360;
            let p = new TouchPoint(x, y, h, down);
            p.count = this.count;
            this.points.push(p);
            this.drawHues();
            let coord = translateCoords(p.x, p.y);
            let valid = coord.valid;
            const limit = 2;
            if (p.down && valid) {
                this.last = translateCoords(p.x + 0.1, p.y);
                console.log(`paint add ${counter++} h=${h / 360}`);
                fetch(`/?action=paint-add-line&ax=${this.last.x}&ay=${this.last.y}&bx=${coord.x}&by=${coord.y}&hue=${h / 360}`);
                this.last = coord;
            }
            else if (valid && coord.distanceTo(this.last) > limit) {
                if (!this.last.valid) {
                    this.last = translateCoords(p.x + 0.1, p.y);
                }
                console.log(`paint add ${counter++} h=${h / 360}`);
                fetch(`/?action=paint-add-line&ax=${this.last.x}&ay=${this.last.y}&bx=${coord.x}&by=${coord.y}&hue=${h / 360}`);
                this.last = coord;
            }
            else if (valid) {
                // ignore lines that are less than the limit of 2 inches
            }
            else {
                this.last = coord;
            }
        }

        public animated: boolean;

        animate(a: boolean) {
            this.animated = a;
        }
    }

    paint = new Paint();

    function animatePaint() {
        if (paint.animated) {
            requestAnimationFrame(animatePaint);
            paint.drawHues();
        }
    }

    function resizeCanvas() {
        let a = paint.animated;
        var r = document.querySelector("canvas").getBoundingClientRect();
        paint.canvas.width = r.width;
        paint.canvas.height = r.height;
        paint.clear();
        paint.animate(a);
    }

    window.addEventListener('resize', () => setTimeout(resizeCanvas, 200));
    window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 200));
    resizeCanvas();

    paint.canvas.addEventListener('mousedown', (event) => {
        const rect = paint.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        paint.addLine(x, y, true);
        paint.pressed = true;
    });

    paint.canvas.addEventListener('mousemove', (event) => {
        if (!paint.pressed) return;
        const rect = paint.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        paint.addLine(x, y, false);
    });

    paint.canvas.addEventListener('mouseup', (event) => {
        paint.pressed = false;
    });

    paint.canvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        paint.pressed = true;
        const rect = paint.canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        paint.addLine(x, y, true);
    });

    paint.canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
        if (!paint.pressed) return;
        const rect = paint.canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        paint.addLine(x, y, false);
    });

    paint.canvas.addEventListener('touchend', (event) => {
        event.preventDefault();
        paint.pressed = false;
    });

    let paintHueSlider = new Slider("#hue.slider")
    paintHueSlider.step = 0.1;

    switchPaint = () => {
        paint.clear();
        setTimeout(resizeCanvas, 200);
    }
}