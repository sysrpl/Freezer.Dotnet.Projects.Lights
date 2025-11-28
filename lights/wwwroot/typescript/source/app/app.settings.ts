let switchSettings: Proc;

function initSettings() {
    let theme = get("#settings #theme");

    function addTheme(color: string) {
        let item = document.createElement("div");
        item.classList.add(color);
        theme.appendChild(item);
    }

    function themeClick(e: Event) {
        for (let item of getAll("#settings #theme div"))
            item.classList.remove("selected");
        let t = e.currentTarget as HTMLElement;
        t.classList.add("selected");
        let s = t.classList.item(0);
        document.body.className = s;
        setCookie("theme", s, 1000);
    }

    addTheme("purple");
    addTheme("green");
    addTheme("orange");
    addTheme("blue");
    for (let item of getAll("#settings #theme div"))
        item.addEventListener("click", themeClick);
    let cookie = getCookie("theme");
    if (cookie == null) {
        cookie = "blue";
    }
    theme.get("." + cookie).click();

    let toggles: Toggle[] = [];
    let t = new Toggle("#settings #projector .toggle");
    t.onchange = (sender) => {
        sender.element.parentElement.get("span").innerText = sender.enabled ? "Projector (on)" : "Projector (off)";
    }
    toggles.push(t);
    t = new Toggle("#settings #mute .toggle");
    t.onchange = (sender) => {
        sender.element.parentElement.get("span").innerText = sender.enabled ? "Mute all audio (yes)" : "Mute all audio (no)";
    }
    toggles.push(t);
    t = new Toggle("#settings #movie .toggle");
    t.onchange = (sender) => {
        sender.element.parentElement.get("span").innerText = sender.enabled ? "Movie (play)" : "Movie (paused)";
    }
    toggles.push(t);
    t = new Toggle("#settings #everything .toggle");
    t.onchange = (sender) => {
        sender.element.parentElement.get("span").innerText = sender.enabled ? "Everything (on)" : "Everything (off)";
        if (sender.enabled) {
            for (let i of toggles)
                if (!i.element.classList.contains("enabled"))
                    i.element.click();
        }
        else {
            for (let i of toggles)
                if (i.element.classList.contains("enabled"))
                    i.element.click();
        }
    }

    // Intensity
    let settingsLightIntensity = new Slider("#settings #light-intensity .slider")
    settingsLightIntensity.max = 5;
    settingsLightIntensity.step = 0.01;
    settingsLightIntensity.move(2.5);

    function intensityChange() {
        let s = get("#settings #light-intensity .label") as HTMLElement;
        let t = settingsLightIntensity.position.toFixed(1);
        s.innerText = `Light (${t})`;
    }

    function intensitySubmit() {
        fetch(`/?action=settings-set-intensity&intensity=${settingsLightIntensity.position}`);
    }

    settingsLightIntensity.onchange = intensityChange;
    settingsLightIntensity.onsubmit = intensitySubmit;

    // Speed
    let settingsLightSpeed = new Slider("#settings #light-speed .slider")
    settingsLightSpeed.min = 0;
    settingsLightSpeed.max = 10;
    settingsLightSpeed.step = 0.001;
    settingsLightSpeed.move(1);

    function speedChange() {
        let s = get("#settings #light-speed .label") as HTMLElement;
        let p = settingsLightSpeed.position - 5;
        s.innerText = `Speed (${p.toFixed(1)})`;
    }

    function speedSubmit() {
        fetch(`/?action=settings-set-speed&speed=${settingsLightSpeed.position - 5}`);
    }

    settingsLightSpeed.onchange = speedChange;
    settingsLightSpeed.onsubmit = speedSubmit;

    // Volume
    let settingsVolume = new Slider("#settings #audio-volume .slider")
    settingsVolume.max = 100;
    settingsVolume.step = 0.01;

    function volumeSubmit() {
        var p = Math.round(settingsVolume.position);
        fetch(`/?action=settings-set-volume&volume=${p}`);
    }

    settingsVolume.onsubmit = volumeSubmit;

    const sleepLabels = ["sleep after 15 minutes", "sleep after 30 minutes", "sleep after 1 hour",
        "sleep after 4 hours", "sleep after 6 hours", "never goto sleep"];
    let sleepIndex = 0;
    let sleepLabel = get("#settings #sleep .label");

    function sleepSend() {
        fetch(`/?action=settings-set-sleep&sleep=${sleepIndex}`);
    }

    get("#settings #sleep .left").addEventListener("click", (e) => {
        sleepIndex--;
        if (sleepIndex < 0)
            sleepIndex = sleepLabels.length - 1;
        sleepLabel.innerText = sleepLabels[sleepIndex];
        sleepSend();
    });

    get("#settings #sleep .right").addEventListener("click", (e) => {
        sleepIndex++;
        if (sleepIndex > sleepLabels.length - 1)
            sleepIndex = 0;
        sleepLabel.innerText = sleepLabels[sleepIndex];
        sleepSend();
    });

    const visualizerLabels = ["no visualizations", "histogram visualization",
        "levels visualization", "cloud visualization", "wave visualization"];
    let visualIndex = 0;
    let visualLabel = get("#settings #visualizer .label");

    function visualsSend() {
        fetch(`/?action=settings-set-visuals&visuals=${visualIndex}`);
    }

    get("#settings #visualizer .left").addEventListener("click", (e) => {
        visualIndex--;
        if (visualIndex < 0)
            visualIndex = visualizerLabels.length - 1;
        visualLabel.innerText = visualizerLabels[visualIndex];
        visualsSend();
    });

    get("#settings #visualizer .right").addEventListener("click", (e) => {
        visualIndex++;
        if (visualIndex > visualizerLabels.length - 1)
            visualIndex = 0;
        visualLabel.innerText = visualizerLabels[visualIndex];
        visualsSend();
    });

    // Audio visualizer sources
    let sourceMusic = get("#visualsource .music");
    let sourceMusicRadio = get("#visualsource .music i");
    let sourceMicrophone = get("#visualsource .microphone");
    let sourceMicrophoneRadio = get("#visualsource .microphone i");

    function sourceClick(e: MouseEvent) {
        let t = e.currentTarget as HTMLElement;
        let s = 0;
        if (t == sourceMusic) {
            sourceMusicRadio.removeClass("fa-circle").addClass("fa-circle-dot");
            sourceMicrophoneRadio.removeClass("fa-circle-dot").addClass("fa-circle");
        }
        else {
            sourceMicrophoneRadio.removeClass("fa-circle").addClass("fa-circle-dot");
            sourceMusicRadio.removeClass("fa-circle-dot").addClass("fa-circle");
            s = 1;
        }
        fetch(`/?action=settings-set-visual-source&source=${s}`);
    }

    sourceMusic.addEventListener("click", sourceClick);
    sourceMicrophone.addEventListener("click", sourceClick);

    new GroupBox("#settings .group.lighting", "group-lighting");
    new GroupBox("#settings .group.equipment", "group-equipment");
    new GroupBox("#settings .group.audio", "group-audio");
    new GroupBox("#settings .group.system", "group-system");

    let accessCode = get("#settings #accesscode");

    function accessCodeRead(code: string[]) {
        accessCode.innerText = `${code[0]}`;
    }

    interface Usage {
        Version: string,
        Date: string,
        MemoryUsage: number,
        Threads: number,
        CpuUsage: number,
        Uptime: string,
        NetworkAddress: string,
        NetworkSent: number,
        NetworkReceived: number
        DataCount0: number
        DataTime0: number
        DataCount1: number
        DataTime1: number
    };

    let settings = get("#settings") as HTMLElement;
    let usageTimer = 0;
    let usageHidden = true;
    let usageSpan = get("#usage") as HTMLElement;

    function usageRead(u: Usage) {
        if (usageHidden || settings.style.display != "block") {
            usageSpan.style.display == "none";
            if (usageTimer)
                clearInterval(usageTimer);
            usageTimer = 0;
            return;
        }
        if (usageTimer == 0)
            usageTimer = setInterval(usageFetch, 5000);
        let left = usageSpan.nthElementChild(0);
        let right = usageSpan.nthElementChild(1);
        left.nthElementChild(0).innerText = `Version: ${u.Version}`;
        left.nthElementChild(1).innerText = `Memory usage: ${u.MemoryUsage.toFixed(0)}MB`;
        left.nthElementChild(2).innerText = `CPU usage: ${u.CpuUsage.toFixed(2)}%`;
        left.nthElementChild(3).innerText = `D0: ${u.DataCount0}`;
        left.nthElementChild(4).innerText = `D1: ${u.DataCount1}`;
        let fps = 0;
        if (u.DataTime0 > 0 && u.DataTime1 > 0)
            fps = 1000 / ((u.DataTime0 + u.DataTime1) / 2);
        else if (u.DataTime0 > 0)
            fps = 1000 / u.DataTime0;
        else if (u.DataTime1 > 0)
            fps = 1000 / u.DataTime1;
        else
            fps = 0;
        left.nthElementChild(5).innerText = `FPS: ${fps.toFixed(1)}`;
        right.nthElementChild(0).innerText = `Date: ${u.Date}`;
        right.nthElementChild(1).innerText = `Threads: ${u.Threads}`;
        right.nthElementChild(2).innerText = `Uptime: ${u.Uptime}`;
        right.nthElementChild(3).innerText = `Network: ${u.NetworkAddress.split(' ')[0]}`;
        right.nthElementChild(4).innerText = `Sent: ${u.NetworkSent.toFixed(2)}MB`;
        right.nthElementChild(5).innerText = `Received: ${u.NetworkReceived.toFixed(2)}MB`;
        usageSpan.style.display = "block";
    }

    function usageFetch() {
        fetchJson("/?action=settings-get-sysinfo", usageRead);
    }

    function usageMouseDown(e: MouseEvent) {
        e.stopPropagation();
    }

    function usageClick(e: Event) {
        if (usageTimer)
            window.clearInterval(usageTimer);
        usageTimer = 0;
        let t = usageSpan;
        usageHidden = !usageHidden;
        if (usageHidden)
            t.style.display = "none";
        else
            fetchJson("/?action=settings-get-sysinfo", usageRead);
    }

    get("#information").addEventListener("mousedown", usageMouseDown);
    get("#information").addEventListener("click", usageClick);

    interface Settings {
        intensity: number,
        speed: number,
        volume: number,
        visuals: number,
        visualsource: number,
        sleep: number
    }

    function settingsRead(s: Settings) {
        settingsLightIntensity.move(s.intensity);
        intensityChange();
        settingsLightSpeed.move(s.speed + 5);
        speedChange();
        sleepIndex = s.sleep;
        sleepLabel.innerText = sleepLabels[sleepIndex];
        visualIndex = s.visuals;
        visualLabel.innerText = visualizerLabels[visualIndex];
        if (s.visualsource == 0) {
            sourceMusicRadio.removeClass("fa-circle").addClass("fa-circle-dot");
            sourceMicrophoneRadio.removeClass("fa-circle-dot").addClass("fa-circle");
        }
        else {
            sourceMicrophoneRadio.removeClass("fa-circle").addClass("fa-circle-dot");
            sourceMusicRadio.removeClass("fa-circle-dot").addClass("fa-circle");
        }
    }

    function volumeRead(v: number) {
        settingsVolume.move(v);
    }

    fetchJson("/?action=settings-get-volume", volumeRead);
    Messages.subscribe("volume", null, volumeRead);

    switchSettings = () => {
        fetchJson("/?action=settings-get-all", settingsRead);
        fetchJson("/?action=settings-get-access-code", accessCodeRead);
        settingsLightIntensity.update();
        settingsLightSpeed.update();
        settingsVolume.update();
        if (!usageHidden)
            usageTimer = setInterval(usageFetch, 5000);
    };
}
