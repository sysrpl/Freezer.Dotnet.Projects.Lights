using System.Diagnostics;
using System.Text;

namespace Lights;

[DefaultPage("/typescript/content/search.html")]
public partial class SearchPage : PageHandler
{
    static readonly object mutex = new();
    static readonly string lastFile = App.AppPath("private/last");
    static readonly string moviePath = App.MapPath("/storage/movies/data");
    static string movieLast = "";
    static string movieList = "[]";

    static string LoadMovies()
    {
        string[] files = Directory.GetFiles(moviePath, "*.json");
        if (files.Length == 0)
            return "[]";
        var s = new StringBuilder();
        s.Append('[');
        for (int i = 0; i < files.Length; i++)
        {
            string content = File.ReadAllText(files[i]);
            content = content.Trim();
            s.Append(content);
            if (i < files.Length - 1)
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

    [Action("search-get-movie-list")]
    public void SearchGetMovieList() => Write(MovieList);

    [Action("search")]
    public void Search()
    {
        const string invalid = "['invalid search']";
        const string success = "['success']";
        const string notfound = "['not found']";
        var title = Read("title").Trim();
        var year = ReadInt("year");
        if (string.IsNullOrWhiteSpace(title))
        {
            Write(invalid);
            return;
        }
        var p = App.AppPath("search/search");
        List<string> a = new();
        a.Add($"title={title}");
        if (year > 1900 && year < 3000)
            a.Add($"year={year}");
        var w = MapPath("/storage/movies");
        var s = RunProgram(p, a, w);
        if (s.Contains("Success! Movie ID: "))
        {
            var existing = s.Contains("already cached");
            s = s.Split("Success! Movie ID: ")[1].Trim() + ".json";
            s = Path.Combine(w, "data", s);
            s = File.ReadAllText(s);
            lock (mutex)
            {
                movieLast = s;
                File.WriteAllText(lastFile, movieLast);
                if (!existing)
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
            Write(success);
        }
        else
        {
            Write(notfound);
            s = notfound;
        }
        _ = App.FindEvent("/movies").Broadcast(s);
    }
}