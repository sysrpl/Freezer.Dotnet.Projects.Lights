let switchMusic: Proc;

function initMusic() {
    let musicVolume: Slider;
    musicVolume = new Slider("#music-volume .slider")
    musicVolume.max = 100;
    musicVolume.step = 0.01;

    function volumeSubmit() {
        fetch(`/?action=music-set-volume&volume=${musicVolume.position}`);
    }

    musicVolume.onsubmit = volumeSubmit;

    let songControl = get("#music .playing i") as HTMLElement;
    let songLabel = get("#music .song.label");

    function stopSong() {
        fetch("/?action=music-stop");
        songLabel.innerText = "Now Playing: (nothing)";
        songControl.classList.remove("fa-circle-stop");
        songControl.classList.add("fa-music");
    }

    songControl.addEventListener("click", stopSong);

    let songRandom = get("#music .random");

    function songRandomShuffle() {
        fetch(`/?action=music-random-shuffle&playlist=${playlistIndex}`);
    }

    songRandom.addEventListener("click", songRandomShuffle);

    let playlist = new PlayList("#music .random", "playlist");
    let playlistCount = 5;
    let playlistIndex = 0;

    function rebuildChecks() {
        for (let i = 0; i < folders.length; i++) {
            let folder = folders[i];
            let f = get(`#music .folder[index="${i}"]`);
            if (!f)
                continue;
            let s = f.getAll(".song");
            for (let j = 0; j < s.length; j++) {
                if (j > folder.songs.length - 1)
                    break;
                let checked = folder.checked[playlistIndex][j] != 0;
                let box = s[j].get("i");
                if (checked) {
                    box.removeClass("fa-square");
                    box.addClass("fa-square-check");
                }
                else {
                    box.removeClass("fa-square-check");
                    box.addClass("fa-square");
                }
            }
        }
        updateAllCounts();
    }

    playlist.onchange = (p) => {
        playlistIndex = p.index;
        fetch(`/?action=music-set-playlist&playlist=${playlistIndex}`);
        rebuildChecks();
    }

    playlistIndex = playlist.index;

    interface Folder {
        name: string,
        songs: string[],
        checked: number[][]
    }

    let folders: Folder[] = [];

    function updateAllCounts() {
        let i = 0;
        for (let folder of getAll("#music .folder")) {
            let n = 0;
            let f = folders[i];
            if (f.checked.length == playlistCount && f.checked[playlistIndex].length > 0) {
                for (let j = 0; j < f.checked[playlistIndex].length; j++)
                    n += f.checked[playlistIndex][j];
                if (n == 0)
                    folder.classList.add("empty");
                else
                    folder.classList.remove("empty");
            }
            else
                folder.classList.add("empty");
            folder.get(".count").innerText = n.toString();
            i++;
        }
    }

    function updateCount(folder: HTMLElement) {
        let i = parseInt(folder.getAttribute("index"));
        let n = 0;
        let f = folders[i];
        if (f.checked.length == playlistCount && f.checked[playlistIndex].length > 0) {
            for (let j = 0; j < f.checked[playlistIndex].length; j++)
                n += f.checked[playlistIndex][j];
            if (n == 0)
                folder.classList.add("empty");
            else
                folder.classList.remove("empty");
        }
        else
            folder.classList.add("empty");
        folder.get(".count").innerText = n.toString();
    }

    function songsRead(f: Folder) {
        let folder: HTMLElement = null;
        let i = 0;
        for (let search of folders) {
            if (f.name == search.name) {
                folder = get(`#music .folder[index="${i}"]`)
                folders[i] = f;
                break;
            }
            i++;
        }
        if (!folder)
            return;
        let s = "";
        for (let i = 0; i < f.songs.length; i++)
            s = s + `<div class="song selectable"><i class="fa-regular
${f.checked[playlistIndex][i] ? "fa-square-check" : "fa-square"}"></i>${f.songs[i]}</div>`;
        folder.get(".songs").innerHTML = s;
        updateCount(folder);
        musicEvents();
    }

    let held: Held;

    function folderClick(e: MouseEvent) {
        if (ScrollArea.current.active)
            return;
        let t = e.target as HTMLElement;
        if (t.closest(".song"))
            return;
        t = e.currentTarget as HTMLElement;
        if (held.wasHeld(t))
            return;
        t = t.parentElement;
        let a = t.attributes;
        let index = parseInt(a.getNamedItem("index").value);
        let opened = a.getNamedItem("opened").value == "1";
        let icon = t.get(".icon") as HTMLElement;
        let songs = t.get(".songs") as HTMLElement;
        if (opened) {
            a.getNamedItem("opened").value = "0";
            icon.classList.remove("fa-folder-open");
            icon.classList.add("fa-folder");
            if (songs)
                songs.classList.add("hidden");
        }
        else {
            a.getNamedItem("opened").value = "1";
            icon.classList.remove("fa-folder");
            icon.classList.add("fa-folder-open");
            if (songs)
                songs.classList.remove("hidden");
            else {
                songs = document.createElement("div");
                songs.classList.add("songs");
                t.appendChild(songs);
                fetchJson(`/?action=music-get-songs&folder=${folders[index].name}`, songsRead);
            }
        }
    }

    function preload(name: string, index: number) {
        setTimeout(() => {
            let songs = document.createElement("div");
            songs.classList.add("songs");
            songs.classList.add("hidden");
            let folder = get(`#music .folder[index="${index - 1}"]`);
            folder.appendChild(songs);
            fetchJson(`/?action=music-get-songs&folder=${name}`, songsRead)
        }, index * 250);
    }

    function folderHeld(h: Held) {
        let folder = h.current.parentElement;
        let name = folder.get(".name").innerText;
        let index = parseInt(folder.getAttribute("index"));
        let all = true;
        let f = folders[index];
        for (let i = 0; i < f.songs.length; i++)
            if (f.checked[playlistIndex][i] == 0) {
                all = false;
                break;
            }
        all = !all;
        for (let i = 0; i < f.songs.length; i++) {
            f.checked[playlistIndex][i] = all ? 1 : 0;
        }
        fetch(`/?action=music-set-held&folder=${name}&playlist=${playlistIndex}&held=${all}`);
        rebuildChecks();
    }

    function folderTapped(h: Held) {
        folderHeld(h);
        let t = h.current.parentElement;
        let a = t.attributes;
        let opened = a.getNamedItem("opened").value == "1";
        let icon = t.get(".icon") as HTMLElement;
        let songs = t.get(".songs") as HTMLElement;
        if (opened) {
            a.getNamedItem("opened").value = "0";
            icon.classList.remove("fa-folder-open");
            icon.classList.add("fa-folder");
            if (songs)
                songs.classList.add("hidden");
        }
        else {
            a.getNamedItem("opened").value = "1";
            icon.classList.remove("fa-folder");
            icon.classList.add("fa-folder-open");
            if (songs)
                songs.classList.remove("hidden");
        }
    }

    function foldersRead(names: string[]) {
        let i = 0;
        let s = "";
        for (let n of names) {
            let f = {
                name: n,
                songs: [],
                checked: Array.from({ length: 5 }, () => []) as number[][]
            }
            folders.push(f);
            s += `
<div class="folder empty" index="${i++}" opened="0">
    <div class="label selectable">
        <i class="icon fa-solid fa-folder"></i>
        <div class="name">${n}</div>
    </div>
    <div class="count">0</div>
</div>`;
            preload(n, i);
        }
        let node = get("#music #folders") as HTMLElement;
        node.innerHTML = s;
        let nodes = node.getAll(".folder .label");
        for (let f of nodes)
            f.addEventListener("click", folderClick);

        held = new Held(...nodes);
        held.onheld = folderHeld;
        held.ontapped = folderTapped;
        updateAllCounts();
        musicEvents();
    }

    function foldersFetch() {
        fetchJson("/?action=music-get-folders", foldersRead);
    }

    function checkSong(checkbox: HTMLElement) {
        let song = checkbox.parentElement;
        let group = song.parentElement;
        let folder = group.parentElement;
        let f = parseInt(folder.getAttribute("index"));
        let list = folders[f].checked;
        let i = Array.from(group.children).indexOf(song);
        i = list[playlistIndex][i] = (list[playlistIndex][i] + 1) % 2;
        if (i) {
            checkbox.removeClass("fa-square");
            checkbox.addClass("fa-square-check");
        }
        else {
            checkbox.removeClass("fa-square-check");
            checkbox.addClass("fa-square");
        }
        let id = song.innerText.split(".")[0];
        fetch(`/?action=music-check-song&folder=${folders[f].name}&song=${id}&playlist=${playlistIndex}&checked=${i}`);
        updateCount(folder);
    }

    function playSong(song: HTMLElement) {
        let folder = song.parentElement.parentElement.get(".label .name").innerText;
        let s = song.innerText;
        let id = s.split(".")[0];
        fetch(`/?action=music-play&folder=${folder}&song=${id}`);
        s = s.substring(s.indexOf(". ") + 2);
        songLabel.innerText = "Now Playing: " + s;
        songControl.classList.remove("fa-music");
        songControl.classList.add("fa-circle-stop");
    }

    foldersFetch();

    function musicClick(e: MouseEvent) {
        if (ScrollArea.current.active)
            return;
        var t = e.target as HTMLElement;
        if (t.hasClass("fa-square") || t.hasClass("fa-square-check")) {
            checkSong(t);
            return;
        }
        getAll("#music .selectable").forEach(item => item.classList.remove("selected"));
        t = e.currentTarget as HTMLElement;
        t.classList.add("selected");
        if (t.hasClass("song"))
            playSong(t);
    }

    function musicEvents() {
        getAll("#music .selectable:not(.attached)").forEach(item => {
            item.addEventListener("click", musicClick);
            item.classList.add("attached");
        });
    }

    musicEvents();

    function volumeRead(i: number[]) {
        musicVolume.move(i[0]);
    }

    let current = "";
    let currentTimer = 0;

    function musicChange() {
        let s = current;
        if (s.length > 0) {
            songControl.classList.remove("fa-music");
            songControl.classList.add("fa-circle-stop");
            s = s.substring(s.indexOf(". ") + 2);
            songLabel.innerText = "Now Playing: " + s;
        }
        else {
            songControl.classList.remove("fa-circle-stop");
            songControl.classList.add("fa-music");
            songLabel.innerText = "Now Playing: (nothing)";
        }
    }

    function musicRead(song: string[]) {
        current = song[0];
        if (currentTimer)
            clearTimeout(currentTimer);
        currentTimer = setTimeout(musicChange, 500);
    }

    function musicConnect() {
        fetchJson("/?action=music-get-song", musicRead);
    }

    Messages.subscribe("music", musicConnect, musicRead);

    switchMusic = function () {
        fetchJson("/?action=music-get-volume", volumeRead);
    }
}
