/// <reference path='../libs/codebot/codebot.ts' />
/// <reference path='../libs/codebot/optional/scrollarea/codebot.scrollarea.ts' />
/// <reference path='../libs/codebot/optional/slider/codebot.slider.ts' />
/// <reference path='../libs/codebot/optional/toggle/codebot.toggle.ts' />
/// <reference path='controls/app.controls.groupbox.ts' />
/// <reference path='controls/app.controls.held.ts' />
/// <reference path='controls/app.controls.playlist.ts' />
/// <reference path='app.debug.ts' />
/// <reference path='app.paint.ts' />
/// <reference path='app.effects.ts' />
/// <reference path='app.music.ts' />
/// <reference path='app.movies.ts' />
/// <reference path='app.settings.ts' />

function main() {
    let local = navigator.userAgent.indexOf("aarch64") > 1 && navigator.userAgent.indexOf("605.1.15") > 1;
    let logo = get("#caption .logo");

    if (local) {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.body.style.cursor = "none";
        fetch("/?action=loader-quit");

        let notify = get("#notify");
        let messageCode = notify.get(".message .code");

        let messageCodeRead = (code: string[]) => {
            messageCode.innerText = `${code[0]}`;
        }

        logo.addEventListener("click", (e) => {
            messageCode.innerText = "------";
            fetchJson("/?action=settings-get-access-code", messageCodeRead);
            notify.classList.remove("hidden");
            fetch("/?action=touch");
        });

        notify.addEventListener("click", (e) => {
            notify.classList.add("hidden");
        });
    }
    else {
        logo.addEventListener("click", (e) => {
            window.open("https://www.woodriverstudio.com/", "_blank");
            fetch("/?action=touch");
        });
    }
    initDebug(false);
    debug(navigator.userAgent);
    debug(new Date().toString());

    let icon = "";

    function iconClick(e: Event) {
        let t = e.currentTarget as HTMLElement;
        let s = t.classList.item(0);
        if (s == "power") {
            icon = s;
            fetch(`/?action=stop`).then(() => location.reload());
            return;
        }
        for (let m of getAll("#caption .mode"))
            m.style.display = "none";
        let mode = get("#caption ." + s);
        mode.style.display = "inline";
        get("#icons").style.display = "none";
        get(".scrollarea").style.display = "block";
        let tab = get("#" + s);
        tab.style.display = tab.hasClass("grid") ? "grid" : "block";
        if (s == "paint")
            switchPaint();
        else if (s == "effects")
            switchEffects();
        else if (s == "music")
            switchMusic();
        else if (s == "movies")
            switchMovies();
        else if (s == "settings")
            switchSettings();
        fetch("/?action=touch");
        icon = s;
        if (window.innerHeight > window.innerWidth)
            logo.style.display = "none";
    }

    function homeClick(e: Event) {
        getAll("#caption .mode").forEach(m => m.style.display = "none");
        get(".scrollarea").style.display = "none";
        get("#icons").style.display = "grid";
        getAll(".scrollbox > div").forEach(d => d.style.display = "none");
        if (icon == "settings")
            fetch("/?action=settings-save");
        fetch("/?action=touch");
        icon = "";
        logo.style.display = "initial";
    }

    function modeClick(e: Event) {
        ScrollArea.current.scollTop();
    }

    function lineClick(e: Event) {
        getAll(".scrollbox .lines > div").forEach(e => e.classList.remove("selected"));
        let t = e.currentTarget as HTMLElement;
        t.classList.add("selected");
        fetch("/?action=touch");
    }

    document.addEventListener("touchstart", () => { }, true);
    new ScrollArea(".scrollarea");

    get("#caption .home").addEventListener("click", homeClick);
    getAll("#caption .mode").forEach(i => i.addEventListener("click", modeClick));
    getAll("#icons .item").forEach(i => i.addEventListener("click", iconClick));
    getAll(".scrollbox .lines > div").forEach(i => i.addEventListener("click", lineClick));
    initPaint();
    initEffects();
    initMusic();
    initMovies();
    initSettings();

    Messages.connect("/events");

    function checkHash() {
        let hash = window.location.hash.slice(1);
        switch (hash) {
            case "paint":
                get("#icons .paint").click();
                break;
            case "effects":
                get("#icons .effects").click();
                break;
            case "music":
                get("#icons .music").click();
                break;
            case "movies":
                get("#icons .movies").click();
                break;
            case "settings":
                get("#icons .settings").click();
                break;
        }
    }

    checkHash();
}
