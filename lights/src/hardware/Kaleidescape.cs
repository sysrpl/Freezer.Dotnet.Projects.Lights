using System.Text.Json;
using System.Text.Json.Serialization;

namespace Lights.Hardware;

public static class Kaleidescape
{
    static readonly string address = HardwareMonitor.KaleidescapeAddress;
    static readonly int port = HardwareMonitor.KaleidescapePort;

    static readonly object mutex = new();
    static KaleidescapeClient client = null;

    static string[] Parse(string response, string s)
    {
        s = s.Replace("\\:", "~");
        s = s.Split(response)[1];
        var items = s.Split(':');
        for (var i = 0; i < items.Length; i++)
            items[i] = items[i].Replace('~', ':');
        return items;
    }

    class PlayStatus
    {
        string playing = "none";
        int speed = 0;
        int titleId = 0;
        string title = "";
        int duration = 0;
        int position = 0;
        public bool Active
        {
            get
            {
                if (string.IsNullOrWhiteSpace(playing))
                    return false;
                return playing != "none";
            }
        }
        [JsonIgnore]
        public bool Changed { get; set; } = false;
        [JsonPropertyName("playing")]
        public string Playing { get => playing; set { if (value != playing) { Changed = true; playing = value; } } }
        [JsonPropertyName("speed")]
        public int Speed { get => speed; set { if (value != speed) { Changed = true; speed = value; } } }
        [JsonPropertyName("titleId")]
        public int TitleId { get => titleId; set { if (value != titleId) { Changed = true; titleId = value; } } }
        [JsonPropertyName("title")]
        public string Title { get => title; set { if (value != title) { Changed = true; title = value; } } }
        [JsonPropertyName("duration")]
        public int Duration { get => duration; set { if (value != duration) { Changed = true; duration = value; } } }
        [JsonPropertyName("position")]
        public int Position { get => position; set { if (value != position) { Changed = true; position = value; } } }
    }

    static readonly PlayStatus status = new();

    static void Update()
    {
        if (status.Changed)
        {
            status.Changed = false;
            var s = JsonSerializer.Serialize(status);
            Program.Events.Broadcast("kaleidescape", s);
        }
    }

    static void HandleMessage(object sender, string e)
    {
        if (e.Contains(":PLAY_STATUS:"))
            lock (status)
            {
                var items = Parse(":PLAY_STATUS:", e);
                int titleId = status.TitleId;
                status.Speed = 0;
                var active = status.Active;
                switch (items[0])
                {
                    case "0":
                        status.Playing = "none";
                        break;
                    case "1":
                        status.Playing = "paused";
                        break;
                    case "2":
                        status.Playing = "playing";
                        break;
                    case "4":
                        status.Playing = "forward";
                        status.Speed = int.Parse(items[1]);
                        break;
                    case "6":
                        status.Playing = "rewind";
                        status.Speed = int.Parse(items[1]);
                        break;
                }
                status.TitleId = int.Parse(items[2]);
                status.Duration = int.Parse(items[3]);
                status.Position = int.Parse(items[4]);
                if (!active && status.Active)
                    Title();
                else
                    Update();
                return;
            }
        if (e.Contains(":TITLE_NAME:"))
            lock (status)
            {
                var items = Parse(":TITLE_NAME:", e);
                status.Title = items[0];
                Update();
                return;
            }
    }

    static KaleidescapeClient Client
    {
        get
        {
            lock (mutex)
            {
                if (client == null)
                {
                    client = new KaleidescapeClient();
                    client.OnMessage += HandleMessage;
                }
                if (!client.IsConnected)
                {
                    _ = client.ConnectAsync(address, port);
                    Sleep(10);
                    if (client.IsConnected)
                    {
                        Sleep(10);
                        _ = client.SendCommandAsync(1, "LEAVE_STANDBY");
                        Sleep(10);
                        _ = client.SendCommandAsync(1, "GO_MOVIE_COVERS");
                        Sleep(10);
                    }
                    else
                        client = null;
                }
            }
            return client;
        }
    }

    public static void Command(string command, string parameters = "") => Client?.SendCommand(1, command, parameters);

    public static void Left() => Command("LEFT");
    public static void Up() => Command("UP");
    public static void Right() => Command("RIGHT");
    public static void Down() => Command("DOWN");
    public static void Back() => Command("BACK");
    public static void Select() => Command("SELECT");
    public static void Search() => Command("GO_SEARCH");
    public static void Options() => Command("STATUS_AND_SETTINGS");
    public static void Title() => Command("GET_PLAYING_TITLE_NAME");
    public static void Play() => Command("PLAY");
    public static void PlayPause() => Command("PLAY_OR_PAUSE");
    public static void Prior() => Command("PREVIOUS");
    public static void Rewind() => Command("SCAN_REVERSE");
    public static void Forward() => Command("SCAN_FORWARD");
    public static void Next() => Command("NEXT");
    public static void Replay() => Command("REPLAY");

    public static void Status(bool force = false)
    {
        if (force)
            lock (status) status.Changed = true;
        Command("GET_PLAY_STATUS");
    }

    public static void Eject()
    {
        Command("STOP");
        Sleep(50);
        Command("GO_MOVIE_COVERS");
    }

    public static void PlayMovie(string movie)
    {
        if (string.IsNullOrWhiteSpace(movie))
            return;
        movie = movie.ToLower().Trim().Replace(":", "\\:");
        Command("STOP");
        Sleep(250);
        Command("BACK");
        Sleep(250);
        Command("GO_MOVIE_LIST");
        Sleep(700);
        Command("FILTER_LIST");
        Sleep(400);
        Command("SET_USER_INPUT_ENTRY", movie);
        Sleep(400);
        Command("SELECT");
        Sleep(700);
        Command("PLAY");
    }
}