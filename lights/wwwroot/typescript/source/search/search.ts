/// <reference path='../libs/codebot/codebot.ts' />

function main() {
    let title = get("#movie-title") as HTMLInputElement;
    let year = get("#movie-year") as HTMLInputElement;
    let search = get("#search-btn")  as HTMLElement;
    let result = get("#result")  as HTMLElement;

    function movieSearch() {
        let t = title.value.trim();
        if (t.length < 1)
            return;
        t = encodeURIComponent(t);
        let y = parseInt(year.value.trim());
        if (Number.isNaN(y))
            y = 0;
        if (y < 1900 || y > 3000)
            y = 0;
        let s = "";
        if (y > 0)
            s = `?action=search&title=${t}&year=${y}`;
        else
            s = `?action=search&title=${t}`;
        fetch(s);
    }

    search.addEventListener("click", movieSearch);

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

    function movieReceived(m: Movie) {
        result.innerHTML = m.plot;
    }

    Messages.subscribe("movies", null, movieReceived);
    Messages.connect("/events");
}
