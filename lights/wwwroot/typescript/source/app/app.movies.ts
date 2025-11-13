let switchMovies: Proc;

function initMovies() {
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
        setTimeout(() => {
            fetch(`/search/?action=search&title=${title}&year=${year}`);
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

    // subscribeEvent("/movies", movieReceived, movieConnect);
    Messages.subscribe("movies", movieConnect, movieReceived);

    switchMovies = function() {
    }
}