let switchMovies: Proc;

function initMovies() {

    interface PlayStatus {
        playing: string,
        speed: number,
        title: string,
        duration: number,
        position: number
    }

    interface MovieStatus {
        selected: string,
        playing: string
    }

    interface State {
        status: PlayStatus,
        movies: MovieStatus,
        powered: boolean,
        muted: boolean
    }

    interface Buttons {
        powered: HTMLElement,
        search: HTMLElement,
        back: HTMLElement
        left: HTMLElement
        up: HTMLElement
        right: HTMLElement
        down: HTMLElement
        select: HTMLElement
        options: HTMLElement
        play: HTMLElement
        eject: HTMLElement
        muted: HTMLElement
        prior: HTMLElement
        rewind: HTMLElement
        forward: HTMLElement
        next: HTMLElement
        replay: HTMLElement
    }

    let state: State = {
        status: {
            playing: "",
            speed: 1,
            title: "",
            duration: 0,
            position: 0
        },
        movies: {
            selected: "",
            playing: ""
        },
        powered: false,
        muted: false
    }

    let buttons: Buttons = {
        powered: get("#powered"),
        search: get("#search"),
        back: get("#back"),
        left: get("#left"),
        up: get("#up"),
        right: get("#right"),
        down: get("#down"),
        select: get("#select"),
        options: get("#options"),
        play: get("#play"),
        eject: get("#eject"),
        muted: get("#muted"),
        prior: get(".button.prior"),
        rewind: get(".button.rewind"),
        forward: get(".button.forward"),
        next: get(".button.next"),
        replay: get(".button.replay"),
    }
    interface Movie {
        movie_id: string;
        title: string;
        year: string;
        director: string;
        genre: string;
        rated: string;
        actors: string[];
        plot: string;
        runtime: string;
        critic_score: string;
        imdb_rating: string;
    }

    let movieList: Movie[] = [];

    let title = get("#movies .details .title") as HTMLElement
    let info = get("#movies .details .info") as HTMLElement;
    let poster = get("#movies .poster") as HTMLImageElement;
    let switcher = get("#movies .switch") as HTMLElement;
    let singleTab = get("#movies .single") as HTMLElement;
    let listTab = get("#movies .list") as HTMLElement;
    let progress = get("#progress") as HTMLElement;
    let single = true;

    function switcherClick() {
        let i = switcher.get("i");
        single = !single;
        if (single) {
            listTab.style.display = "none";
            singleTab.style.display = "initial";
            i.classList.remove("fa-film");
            i.classList.add("fa-list");
        }
        else {
            singleTab.style.display = "none";
            listTab.style.display = "initial";
            i.classList.remove("fa-list");
            i.classList.add("fa-film");
        }
    }

    function movieClick(e: Event) {
        if (ScrollArea.current.active)
            return;
        getAll("#movies .movie").forEach(e => e.classList.remove("selected"));
        let t = e.currentTarget as HTMLElement;
        t.classList.add("selected");
        fetch("/?action=touch");
        let title = t.attributes.getNamedItem("title").value;
        let year = t.attributes.getNamedItem("year").value;
        let movie = movieList.find(m => m.title === title && m.year === year);
        setTimeout(() => {
            movieReceived(movie);
        }, 1000);
    }

    function rebuildList() {
        let s = "";
        for (let m of movieList)
            s += `<div class="movie" title="${m.title}" year="${m.year}"><img title="poster" class="poster" src="/storage/movies/data/${m.movie_id}.jpg">
                <span class="title">${m.title} (${m.year})</span>
                <span class="info">rated ${m.rated} | imdb ${m.imdb_rating} | ${m.genre} | staring ${m.actors.join(", ")}</span>
                <span class="summary">${m.plot}</span>
                </div>`;
        listTab.innerHTML = s;
        getAll("#movies .movie").forEach(i => i.addEventListener("click", movieClick));
    }

    switcher.addEventListener("click", switcherClick);

    function movieReceived(m: Movie) {
        state.movies.selected = m.title;
        title.innerText = `${m.title} (${m.year})`;
        poster.src = `/storage/movies/data/${m.movie_id}.jpg`;
        info.innerHTML = `${m.runtime} <span class="imdb">imdb</span> rating ${m.imdb_rating}
Rated ${m.rated} | ${m.genre}
Directed by ${m.director}
Starring ${m.actors.join(", ")}

Summary: ${m.plot}`;
        let found = movieList.find(x => x.title === m.title && x.year === m.year);
        if (!found) {
            movieList.push(m);
            movieList.sort((a, b) => {
                if (a.title < b.title) return -1;
                if (a.title > b.title) return 1;
                return parseInt(a.year) - parseInt(b.year);
            });
            rebuildList();
        }
        single = false;
        fetchPost("/search/?action=search-set-movie-last", { movie: JSON.stringify(m) });
        switcherClick();
    }

    function movieListReceived(m: Movie[]) {
        movieList = m;
        movieList.sort((a, b) => {
            if (a.title < b.title) return -1;
            if (a.title > b.title) return 1;
            return parseInt(a.year) - parseInt(b.year);
        });
        rebuildList();
        fetchJson("/search/?action=search-get-movie-last", movieReceived);
    }

    function movieConnect() {
        fetchJson("/search/?action=search-get-movie-list", movieListReceived);
    }

    function convertToTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateStatus() {
        let icon = get("#movies .go-play") as HTMLElement;
        if (state.status.playing == "" || state.status.playing == "none") {
            get("#movies #waiting").style.display = "none";
            get("#movies .single").classList.remove("playing");
            if (icon.hasClass("fa-pause")) {
                icon.removeClass("fa-pause");
                icon.addClass("fa-play");
            }
            return;
        }
        let m = movieList.find(movie => movie.title == state.status.title) || null;
        if (!m)
            return;
        progress.get(".title").innerText = `${m.title} (${m.year})`;
        let p = progress.get(".poster") as HTMLImageElement;
        let s = `/storage/movies/data/${m.movie_id}.jpg`;
        p.src = s;
        let position = convertToTime(state.status.position);
        let duration = convertToTime(state.status.duration);
        if (state.status.playing == "playing" || state.status.playing == "paused") {
            s = `${state.status.playing} at ${position} of ${duration}`;
            if (state.status.playing == "playing") {
                if (icon.hasClass("fa-pause")) {
                    icon.removeClass("fa-pause");
                    icon.addClass("fa-play");
                }
            }
            else {
                if (icon.hasClass("fa-play")) {
                    icon.removeClass("fa-play");
                    icon.addClass("fa-pause");
                }
            }
        }
        else {
            if (icon.hasClass("fa-pause")) {
                icon.removeClass("fa-pause");
                icon.addClass("fa-play");
            }
            switch (state.status.speed) {
                case 1:
                    s = "4x";
                    break;
                case 2:
                    s = "8x";
                    break;
                case 3:
                    s = "16x";
                    break;
                default:
                    s = "1x";
            }
            s = `${state.status.playing} ${s} speed at ${position} of ${duration}`;
        }
        progress.get(".speed").innerText = s;
        let percent = state.status.position / state.status.duration * 100;
        progress.get(".position").style.width = `${percent}%`;
        get("#movies .single").classList.add("playing");
        get("#movies #waiting").style.display = "none";
    }

    function kaleidescapeReceived(status: PlayStatus) {
        state.status = status;
        state.status.title = state.status.title.replace("\\:", ":");
        console.log(state.status.title);
        updateStatus();
    }

    function kaleidescapeConnect() {
        fetch("/?action=movies-status");
    }

    function poweredReceived(powered: boolean) {
        state.powered = powered;
        let i = get(".go-powered");
        if (state.powered) {
            i.classList.remove("fa-solid");
            i.classList.add("fa-regular");
        }
        else {
            i.classList.remove("fa-regular");
            i.classList.add("fa-solid");
        }
    }

    function poweredConnect() {
        fetchJson("/?action=movies-get-powered", poweredReceived);
    }

    function mutedReceived(muted: boolean) {
        state.muted = muted;
        let i = get(".go-muted");
        if (state.muted) {
            i.classList.remove("fa-volume-low");
            i.classList.add("fa-volume-xmark");
        }
        else {
            i.classList.remove("fa-volume-xmark");
            i.classList.add("fa-volume-low");
        }
    }

    function mutedConnect() {
        fetchJson("/?action=movies-get-muted", mutedReceived);
    }

    function poweredClick() {
        fetch("/?action=movies-toggle-powered");
    }

    function searchClick() {
        fetch("/?action=movies-search");
    }

    function backClick() {
        fetch("/?action=movies-back");
    }

    function leftClick() {
        fetch("/?action=movies-left");
    }

    function upClick() {
        fetch("/?action=movies-up");
    }

    function rightClick() {
        fetch("/?action=movies-right");
    }

    function downClick() {
        fetch("/?action=movies-down");
    }

    function selectClick() {
        fetch("/?action=movies-select");
    }

    function optionsClick() {
        fetch("/?action=movies-options");
    }

    function playClick() {
        if (state.status.playing == "none") {
            fetchPost("/?action=movies-play-movie", { movie: state.movies.selected });
            let p = get("#movies #waiting");
            p.style.display = "block";
            return;
        }
        if (state.status.playing == "playing") {
            fetch("/?action=movies-play-pause");
            return;
        }
        if (state.status.playing == "paused") {
            fetch("/?action=movies-play-pause");
            return;
        }
        if (state.status.playing == "rewind") {
            fetch("/?action=movies-play");
            return;
        }
        if (state.status.playing == "forward") {
            fetch("/?action=movies-play");
            return;
        }
    }

    function ejectClick() {
        get("#movies #waiting").style.display = "none";
        fetch("/?action=movies-eject");
    }

    function mutedClick() {
        fetch("/?action=movies-toggle-muted");
    }

    function priorClick() {
        fetch("/?action=movies-prior");
    }

    function rewindClick() {
        fetch("/?action=movies-rewind");
    }

    function forwardClick() {
        fetch("/?action=movies-forward");
    }

    function nextClick() {
        fetch("/?action=movies-next");
    }

    function replayClick() {
        fetch("/?action=movies-replay");
    }

    buttons.powered.addEventListener("click", poweredClick);
    buttons.search.addEventListener("click", searchClick);
    buttons.back.addEventListener("click", backClick);
    buttons.left.addEventListener("click", leftClick);
    buttons.up.addEventListener("click", upClick);
    buttons.right.addEventListener("click", rightClick);
    buttons.down.addEventListener("click", downClick);
    buttons.select.addEventListener("click", selectClick);
    buttons.options.addEventListener("click", optionsClick);
    buttons.play.addEventListener("click", playClick);
    buttons.eject.addEventListener("click", ejectClick);
    buttons.muted.addEventListener("click", mutedClick);
    buttons.prior.addEventListener("click", priorClick);
    buttons.rewind.addEventListener("click", rewindClick);
    buttons.forward.addEventListener("click", forwardClick);
    buttons.next.addEventListener("click", nextClick);
    buttons.replay.addEventListener("click", replayClick);

    Messages.subscribe("movies", movieConnect, movieReceived);
    Messages.subscribe("kaleidescape", kaleidescapeConnect, kaleidescapeReceived);
    Messages.subscribe("powered", poweredConnect, poweredReceived);
    Messages.subscribe("muted", mutedConnect, mutedReceived);

    switchMovies = function () {
    }
}