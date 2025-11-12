using System.Text.Json;
using System.Text.Json.Serialization;

namespace Lights;

public partial class HomePage : PageHandler
{
    static readonly object mutex = new();
    static bool shuffling = false;

    static string MusicPath
    {
        get
        {
            const string music = "Music/jukebox";
            var folder = Environment.GetEnvironmentVariable("HOME");
            return Path.Combine(folder, music);
        }
    }

    class MusicFolder
    {
        static readonly string empty = JsonSerializer.Serialize(new MusicFolder());

        [JsonPropertyName("name")]
        public string Name { get; set; }
        [JsonPropertyName("songs")]
        public string[] Songs { get; set; }
        [JsonPropertyName("checked")]
        public int[][] Checked { get; set; }

        public MusicFolder(string name = "")
        {
            Name = name;
            Songs = [];
            Checked = new int[playlistCount][];
        }

        public static string Empty { get => empty; }
    }

    static MusicFolder[] folders = [];
    static int playlistIndex = 0;
    const int playlistCount = 5;

    static void ShuffleTask()
    {
        while (true)
        {
            Sleep(2000);
            lock (mutex)
            {
                if (!shuffling)
                    continue;
                if (AudioEngine.Playing)
                    continue;
                var item = GetRandomSong();
                if (item.HasValue)
                {
                    shuffling = true;
                    InternalMusicPlay(item?.Folder, item?.Song.Split(". ")[0]);
                }
            }
        }
    }

    static void MusicSave()
    {
        lock (mutex)
        {
            var path = AppPath("private/music.json");
            string json = JsonSerializer.Serialize(folders);
            File.WriteAllText(path, json);
        }
    }

    static void MusicLoad()
    {
        var path = AppPath("private/music.json");
        if (!File.Exists(path))
            return;
        string json = File.ReadAllText(path);
        folders = JsonSerializer.Deserialize<MusicFolder[]>(json) ?? [];
    }

    struct RandomSong
    {
        public string Folder;
        public string Song;
    }

    static RandomSong? GetRandomSong()
    {
        var checkedSongs = new List<(int FolderIndex, int SongIndex)>();

        // Collect all checked songs for the given playlist
        for (int folderIndex = 0; folderIndex < folders.Length; folderIndex++)
        {
            var folder = folders[folderIndex];

            // Check if the playlist index is valid for this folder
            if (playlistIndex >= 0 && playlistIndex < folder.Checked.Length)
            {
                var playlistChecked = folder.Checked[playlistIndex];

                // Check if playlistChecked is not null
                if (playlistChecked != null)
                {
                    for (int songIndex = 0; songIndex < playlistChecked.Length; songIndex++)
                    {
                        // Check if song is marked as checked (non-zero)
                        if (playlistChecked[songIndex] != 0 && songIndex < folder.Songs.Length)
                        {
                            checkedSongs.Add((folderIndex, songIndex));
                        }
                    }
                }
            }
        }

        // Return null if no checked songs found
        if (checkedSongs.Count == 0)
            return null;

        // Pick a random song
        var random = new Random();
        var (folderIdx, songIdx) = checkedSongs[random.Next(checkedSongs.Count)];

        return new RandomSong
        {
            Folder = folders[folderIdx].Name,
            Song = folders[folderIdx].Songs[songIdx]
        };
    }

    [Action("music-stop")]
    public void MusicStop()
    {
        lock (mutex)
        {
            shuffling = false;
            AudioEngine.CloseMusic();
            SleepMonitor.Touch();
        }
    }

    static void InternalMusicPlay(string folder, string song)
    {
        if (string.IsNullOrEmpty(folder) | string.IsNullOrEmpty(song))
            return;
        if (folders.Length == 0)
            return;
        if (!folders.Any(f => f.Name == folder))
            return;
        var musicFolder = folders.First(f => f.Name == folder);
        song = musicFolder.Songs.FirstOrDefault(f => f.StartsWith(song));
        if (string.IsNullOrEmpty(song))
            return;
        var fileName = Path.Combine(MusicPath, folder, song) + ".mp3";
        if (File.Exists(fileName))
            AudioEngine.OpenMusic(fileName);
    }

    [Action("music-play")]
    public void MusicPlay()
    {
        lock (mutex)
        {
            shuffling = false;
            InternalMusicPlay(Read("folder"), Read("song"));
        }
        SleepMonitor.Touch();
    }

    [Action("music-random-shuffle")]
    public void MusicRandomShuffle()
    {
        lock (mutex)
        {
            playlistIndex = Math.Clamp(ReadInt("playlist"), 0, playlistIndex);
            var item = GetRandomSong();
            if (item.HasValue)
            {
                shuffling = true;
                InternalMusicPlay(item?.Folder, item?.Song.Split(". ")[0]);
            }
        }
        SleepMonitor.Touch();
    }

    [Action("music-get-playlist")]
    public void MusicGetPlaylist()
    {
        lock (mutex)
            Write($"[{playlistIndex}]");
    }

    [Action("music-set-playlist")]
    public void MusicSetPlaylist()
    {
        lock (mutex)
            playlistIndex = Math.Clamp(ReadInt("playlist"), 0, playlistCount);
    }

    [Action("music-check-song")]
    public void MusicCheckSong()
    {
        var folder = Read("folder");
        var song = Read("song");
        var check = Math.Clamp(ReadInt("checked"), 0, 1);
        var playlist = ReadInt("playlist");
        lock (mutex)
        {
            playlistIndex = Math.Clamp(playlist, 0, playlistCount);
            if (string.IsNullOrEmpty(folder) | string.IsNullOrEmpty(song))
                return;
            var i = Array.FindIndex(folders, f => f.Name == folder);
            if (i < 0)
                return;
            var j = Array.FindIndex(folders[i].Songs, s => s.StartsWith(song));
            if (j < 0)
                return;
            folders[i].Checked[playlistIndex][j] = check;
            MusicSave();
        }
    }

    [Action("music-set-held")]
    public void MusicSetHeld()
    {
        var folder = Read("folder");
        var playlist = Math.Clamp(ReadInt("playlist"), 0, playlistCount);
        var held = ReadBool("held");
        lock (mutex)
        {
            var i = Array.FindIndex(folders, f => f.Name == folder);
            if (i < 0)
                return;
            var f = folders[i];
            for (i = 0; i < f.Songs.Length; i++)
                f.Checked[playlistIndex][i] = held ? 1 : 0;
            MusicSave();
        }
    }

    [Action("music-get-playtime")]
    public void MusicGetPlaytime() => Write($"[ {AudioEngine.Playtime} ]");

    [Action("music-get-playing")]
    public void MusicGetPlaying() => Write($"[ {AudioEngine.Playing} ]");

    [Action("music-get-song")]
    public void MusicGetSong() => Write($"[ \"{AudioEngine.Song}\" ]");

    [Action("music-get-volume")]
    public void MusicGetVolume() => Write($"[ {state.MusicVolume} ]");

    [Action("music-set-volume")]
    public void MusicSetVolume()
    {
        state.MusicVolume = ReadFloat("volume");
        state.SaveVolume();
    }

    [Action("music-save-state")]
    public void MusicSaveState()
    {
        MusicSave();
    }

    [Action("music-get-folders")]
    public void MusicGetFolders()
    {
        if (folders.Length == 0)
            lock (mutex)
            {
                var folder = MusicPath;
                var list = Directory.GetDirectories(folder)
                    .Select(s => new DirectoryInfo(s).Name)
                    .OrderBy(s => char.IsDigit(s[0]))
                    .ThenBy(s => s, StringComparer.OrdinalIgnoreCase)
                    .ToList();
                folders = new MusicFolder[list.Count];
                for (var i = 0; i < list.Count; i++)
                    folders[i] = new MusicFolder(list[i]);
            }
        Write(JsonSerializer.Serialize(folders.Select(f => f.Name)));
    }

    [Action("music-get-songs")]
    public void MusicGetSongs()
    {
        var folder = Read("folder");
        if (string.IsNullOrWhiteSpace(folder))
        {
            Write(MusicFolder.Empty);
            return;
        }
        var folderIndex = -1;
        if (folders != null)
            for (int i = 0; i < folders.Length; i++)
                if (folders[i].Name == folder)
                {
                    folderIndex = i;
                    break;
                }
        if (folderIndex < 0)
        {
            Write(MusicFolder.Empty);
            return;
        }
        var current = folders[folderIndex];
        // If we have songs cached, return them
        if (current.Songs.Length > 0)
        {
            Write(JsonSerializer.Serialize(current));
            return;
        }
        // Otherwise, read from disk
        var s = Path.Combine(MusicPath, folder);
        if (!Directory.Exists(s))
        {
            Write(JsonSerializer.Serialize(new MusicFolder(folder)));
            return;
        }
        var list = Directory.GetFiles(s)
            .Where(s => s.EndsWith(".mp3"))
            .Select(Path.GetFileNameWithoutExtension)
            .OrderBy(s => s)
            .ToArray();
        current.Songs = list;
        current.Checked = new int[playlistCount][];
        for (var i = 0; i < playlistCount; i++)
            current.Checked[i] = new int[list.Length];
        Write(JsonSerializer.Serialize(current));
    }
}