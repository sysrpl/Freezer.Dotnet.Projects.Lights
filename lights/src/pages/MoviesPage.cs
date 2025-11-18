namespace Lights;

public partial class HomePage : PageHandler
{
    [Action("movies-rebuild")]
    public void MoviesRebuild() =>_ = SearchPage.DownloadMovies();
}
