namespace Lights;

[DefaultPage("/typescript/content/home.html", IsTemplate = true)]
public partial class HomePage : PageHandler
{
    static readonly LightState state;

    [Action("loader-quit")]
    public void LoaderQuit()
    {
        const string home = "/home/pi";
        const string quit = "/home/pi/quit";
        if (Directory.Exists(home))
        {
            var f = File.Open(quit, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.ReadWrite);
            f.Dispose();
        }
    }

    [Action("connect")]
    public void Connect()
    {
        var host = Read("host");
        if (string.IsNullOrWhiteSpace(host))
            TestSocket.Disconnect();
        else
            TestSocket.Connect(host);
    }

    [Action("reload")]
    public void Reload() => _ = Program.Events.Broadcast("reload", "true");

    public string NoCache
    {
        get => $"?v={new Random().Next(1, 1_000_001)}";
    }

    public static void StaticStop()
    {
        lock (mutex)
        {
            shuffling = false;
            AudioEngine.CloseMusic();
            state.VisualSource = AudioVisualSource.Music;
            state.Effect = "none";
        }
    }

    [Action("stop")]
    public void Stop() => StaticStop();

    [Action("touch")]
    public void Touch() => SleepMonitor.Touch();

    static HomePage()
    {
        state = LightState.Current;
        MusicLoad();
        Task.Run(ShuffleTask);
    }
}