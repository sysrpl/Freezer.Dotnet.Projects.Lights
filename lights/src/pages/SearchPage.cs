using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using CsvHelper;
using CsvHelper.Configuration.Attributes;

namespace Lights;


public class MovieInfo
{
    [JsonPropertyName("title")]
    public string Title { get; set; }
    [JsonPropertyName("year")]
    public int Year { get; set; }
    [JsonPropertyName("movie_id")]
    [Ignore]
    public string MovieId { get; set; }
}

[DefaultPage("/typescript/content/search.html")]
public partial class SearchPage : PageHandler
{
    static readonly object mutex = new();
    static readonly string lastFile = App.AppPath("private/last");
    static readonly string moviePath = App.MapPath("/storage/movies/");
    static string movieLast;
    static string movieList;

    static string LoadMovies()
    {
        var movies = Path.Combine(moviePath, "movies.json");
        var files = new List<string>();
        if (File.Exists(movies))
        {
            movies = File.ReadAllText(movies);
            using JsonDocument doc = JsonDocument.Parse(movies);
            var names = doc.RootElement
                .GetProperty("movies")
                .EnumerateArray()
                .Select(movie => movie.GetProperty("movie_id").GetString())
                .ToList();
            foreach (var n in names)
            {
                var f = Path.Combine(moviePath, "data", $"{n}.json");
                if (File.Exists(f))
                    files.Add(f);
            }
        }
        var s = new StringBuilder();
        s.Append('[');
        for (int i = 0; i < files.Count; i++)
        {
            string content = File.ReadAllText(files[i]);
            content = content.Trim();
            s.Append(content);
            if (i < files.Count - 1)
                s.Append(',');
        }
        s.Append(']');
        return s.ToString();
    }

    static SearchPage()
    {
        movieLast = File.ReadAllText(lastFile);
        movieList = LoadMovies();
    }

    public static bool InternalSearch(string title, int year) => InternalSearch(title, year, out _, out _);
    public static bool InternalSearch(string title, int year, out string movieId, out bool added)
    {
        var success = false;
        movieId = string.Empty;
        added = false;
        lock (mutex)
        {
            var p = App.AppPath("search/search");
            List<string> a = new();
            a.Add($"title={title}");
            if (year > 1900 && year < 3000)
                a.Add($"year={year}");
            var w = App.MapPath("/storage/movies");
            var s = RunProgram(p, a, w);
            success = s.Contains("Success! Movie ID: ");
            if (success)
            {
                added = !s.Contains("already cached");
                s = s.Split("Success! Movie ID: ")[1].Trim();
                movieId = s;
                s += ".json";
                s = Path.Combine(w, "data", s);
                s = File.ReadAllText(s);
                movieLast = s;
                File.WriteAllText(lastFile, movieLast);
                if (added)
                {
                    if (movieList == "[]")
                        movieList = $"[{s}]";
                    else
                    {
                        movieList = movieList[..^1];
                        movieList = $"{movieList},{s}]";
                    }
                }
            }
        }
        return success;
    }

    static bool reloading;
    static readonly object reloadMutex = new();
    static readonly JsonSerializerOptions indented = new() { WriteIndented = true };

    static readonly string movieListEndpoint = GetMovieListEndpoint();

    static string GetMovieListEndpoint()
    {
        var s = App.AppPath($"private/movie-list.{Program.LocalName}.txt");
        return File.ReadAllText(s).Trim();
    }

    public static async Task DownloadMovies()
    {
        var token = App.StopToken;
        try
        {
            using var handler = new SocketsHttpHandler
            {
                ConnectTimeout = TimeSpan.FromSeconds(3)
            };
            using var client = new HttpClient(handler)
            {
                Timeout = TimeSpan.FromSeconds(3)
            };
            var response = await client.GetAsync(movieListEndpoint, token);
            var movies = await response.Content.ReadAsStringAsync(token);
            if (movies.Contains("Lead Actor"))
            {
                using var reader = new StringReader(movies);
                using var csv = new CsvReader(reader, System.Globalization.CultureInfo.InvariantCulture);
                var list = csv.GetRecords<MovieInfo>().ToArray();
                await ReloadMovies(list, token);
            }
        }
        catch
        {
        }
    }

    public static async Task ReloadMovies(MovieInfo[] movies, CancellationToken token)
    {
        var busy = false;
        lock (reloadMutex)
            busy = reloading;
        if (busy)
            return;
        lock (reloadMutex)
            reloading = true;
        lock (reloadMutex)
            reloading = false;
        foreach (var m in movies)
        {
            if (token.IsCancellationRequested)
                return;
            await Task.Delay(100, token);
            if (InternalSearch(m.Title, m.Year, out string movieId, out bool added))
            {
                m.MovieId = movieId;
                if (added)
                    await Task.Delay(2500, token);
            }
            else
                await Task.Delay(2500, token);
        }
        var filtered = movies.Where(m => !string.IsNullOrWhiteSpace(m.MovieId));
        var list = new { movies = filtered };
        var json = JsonSerializer.Serialize(list, indented);
        var fileName = Path.Combine(moviePath, "movies.json");
        var changed = false;
        lock (mutex)
        {
            if (File.Exists(fileName))
            {
                var original = File.ReadAllText(fileName);
                changed = json != original;
                if (changed)
                    File.Delete(fileName);
            }
            else
                changed = true;
            if (changed)
                File.WriteAllText(fileName, json);
        }
        if (changed && !token.IsCancellationRequested)
            await Program.Events.BroadcastAsync("movies", movieLast);
    }

    public static string MovieLast
    {
        get
        {
            lock (mutex)
                return movieLast;
        }
    }

    public static string MovieList
    {
        get
        {
            lock (mutex)
                return movieList;
        }
    }

    static string RunProgram(string program, List<string> arguments, string workingDirectory)
    {
        var processStartInfo = new ProcessStartInfo
        {
            FileName = program,
            WorkingDirectory = workingDirectory,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };
        foreach (var arg in arguments)
            processStartInfo.ArgumentList.Add(arg);
        using var process = Process.Start(processStartInfo);
        string output = process.StandardOutput.ReadToEnd();
        string error = process.StandardError.ReadToEnd();
        process.WaitForExit();
        return output + error;
    }

    [Action("search-get-movie-last")]
    public void SearchGetMovieLast() => Write(MovieLast);

    static bool searching = false;

    static async Task SearchMonitor()
    {
        var token = App.StopToken;
        try
        {
            while (true)
            {
                await Task.Delay(10 * 60 * 1000, token);
                await DownloadMovies();
            }
        }
        catch
        {
        }
    }

    [Action("search-get-movie-list")]
    public void SearchGetMovieList()
    {
        Write(MovieList);
        lock (mutex)
        {
            if (searching)
                return;
            searching = true;
            _ = SearchMonitor();
        }
    }

    [Action("search")]
    public void Search()
    {
        const string invalid = "[\"invalid search\"]";
        const string success = "[\"success\"]";
        const string notfound = "[\"not found\"]";
        var title = Read("title").Trim();
        var year = ReadInt("year");
        if (string.IsNullOrWhiteSpace(title))
        {
            Write(invalid);
            return;
        }
        if (InternalSearch(title, year))
        {
            Write(success);
            Program.Events.Broadcast("movies", movieLast);
        }
        else
        {
            Write(notfound);
        }
    }
}