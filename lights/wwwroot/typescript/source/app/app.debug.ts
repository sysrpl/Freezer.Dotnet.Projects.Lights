//let debug: Action<string>;

function initDebug(enabled: boolean) {

    let area = get("#debug") as HTMLDivElement;

    function write(s: string) {
        if (!enabled)
            return;
        if (s.length == 0)
            return;
        var d = document.createElement("div");
        d.innerText = s;
        area.prepend(d);
    }

    debug = write;
}