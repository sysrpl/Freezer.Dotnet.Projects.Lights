namespace Lights;

using Lights.Hardware;

public partial class HomePage : PageHandler
{
    [Action("movies-rebuild")]
    public void MoviesRebuild() =>_ = SearchPage.DownloadMovies();
    [Action("movies-left")]
    public void MoviesLeft() => Kaleidescape.Left();
    [Action("movies-up")]
    public void MoviesUp() => Kaleidescape.Up();
    [Action("movies-right")]
    public void MoviesRight() => Kaleidescape.Right();
    [Action("movies-down")]
    public void MoviesDown() => Kaleidescape.Down();
    [Action("movies-select")]
    public void MoviesSelect() => Kaleidescape.Select();
    [Action("movies-options")]
    public void MoviesOptions() => Kaleidescape.Options();
    [Action("movies-play")]
    public void MoviesPlay() => Kaleidescape.Play();
    [Action("movies-play-pause")]
    public void MoviesPlayPause() => Kaleidescape.PlayPause();
    [Action("movies-eject")]
    public void MoviesEject() => Kaleidescape.Eject();
    [Action("movies-search")]
    public void MoviesSearch() => Kaleidescape.Search();
    [Action("movies-back")]
    public void MoviesBack() => Kaleidescape.Back();
    [Action("movies-toggle-powered")]
    public void MoviesTogglePowered() => HardwareMonitor.Powered = !HardwareMonitor.Powered;
    [Action("movies-get-powered")]
    public void MoviesGetPowered() => Write(HardwareMonitor.Powered);
    [Action("movies-get-powered")]
    public void MoviesSetPowered() => HardwareMonitor.Powered = ReadBool("powered");
    [Action("movies-toggle-muted")]
    public void MoviesToggleMuted() => HardwareMonitor.Muted = !HardwareMonitor.Muted;
    [Action("movies-get-muted")]
    public void MoviesGetMuted() => Write(HardwareMonitor.Muted);
    [Action("movies-set-muted")]
    public void MoviesSetMuted() => HardwareMonitor.Muted = ReadBool("muted");
    [Action("movies-get-volume")]
    public void MoviesGetVolume() => Write(HardwareMonitor.Volume.ToString());
    [Action("movies-set-volume")]
    public void MoviesSetVolume() => HardwareMonitor.Volume = ReadInt("volume");
    [Action("movies-status")]
    public void MoviesStatus() =>  Kaleidescape.Status(true);
    [Action("movies-play-movie")]
    public void MoviesPlayMovie() =>  Kaleidescape.PlayMovie(Read("movie"));
    [Action("movies-prior")]
    public void MoviesPrior() =>  Kaleidescape.Prior();
    [Action("movies-rewind")]
    public void MoviesRewind() =>  Kaleidescape.Rewind();
    [Action("movies-forward")]
    public void MoviesForward() =>  Kaleidescape.Forward();
    [Action("movies-next")]
    public void MoviesNext() =>  Kaleidescape.Next();
    [Action("movies-replay")]
    public void MoviesReplay() =>  Kaleidescape.Replay();

}
