using System.Diagnostics;
using System.Drawing;

namespace Lights;

public class LightState
{
    public const float lightmax = 0.55f;
    public static readonly object Mutex = new();
    public static readonly LightState Current;
    private static readonly Stopwatch timer = Stopwatch.StartNew();
    private static double seconds = 0;

    readonly LightStrip d0;
    readonly LightStrip d1;
    int line;
    int section;
    float intensity;
    float speed;
    bool off;
    string effect;
    double time0;
    double time1;
    double sync;
    bool running;
    float musicVolume;
    float masterVolume;
    Color color;
    AudioVisuals visuals;
    AudioVisualSource visualSource;
    readonly List<LineSegment> fingerPaint = [];

    static readonly Random rand = new();
    static long shuffleIndex;
    static string[] shuffle = [];

    static void ShuffleRun()
    {
        var time = new Stopwatch();
        time.Start();
        var index = shuffleIndex;
        while (true)
        {
            Sleep(250);
            lock (Mutex)
            {
                if (shuffle.Length == 0)
                    continue;
                if (index == shuffleIndex)
                {
                    if (time.Elapsed.TotalSeconds > 10)
                    {
                        time.Restart();
                        Current.effect = shuffle[rand.Next(shuffle.Length)];
                    }
                    continue;
                }
                index = shuffleIndex;
                time.Restart();
            }
        }
    }

    static LightState()
    {
        Current = new LightState();
        Current.Load();
        Current.LoadVolume();
        Task.Run(ShuffleRun);
    }

    public LightState()
    {
        d0 = new LightStrip();
        d1 = new LightStrip();
        line = 0;
        section = 0;
        intensity = 0.5f;
        speed = 1f;
        off = false;
        effect = "none";
        time0 = 0;
        time1 = 0;
        sync = 0;
        musicVolume = 50;
        masterVolume = 50;
        color = Color.Black;
        visuals = AudioVisuals.None;
        running = true;
    }

    public void Assign(LightState source)
    {
        const double delay = 1 / 30d;
        const double lifetime = 2;
        lock (Mutex)
        {
            // When assigned expired finger paint line segments are removed
            var s = timer.Elapsed.TotalSeconds;
            if (s - seconds > delay)
            {
                seconds = s;
                foreach (var item in source.fingerPaint)
                {
                    var life = 1 - (s - item.Stamp) / lifetime;
                    item.Life = (float)life;
                }
                source.fingerPaint.RemoveAll(item => item.Life <= 0);
            }
            d0.Assign(source.d0);
            d1.Assign(source.d1);
            line = source.line;
            section = source.section;
            intensity = source.intensity;
            speed = source.speed;
            off = source.off;
            effect = source.effect;
            running = source.running;
            color = source.color;
            visuals = source.visuals;
            visualSource = source.visualSource;
            fingerPaint.Clear();
            fingerPaint.AddRange(source.fingerPaint);
        }
    }

    public int Section
    {
        get => section;
        set
        {
            lock (Mutex)
            {
                var d = line == 0 ? d0 : d1;
                section = Math.Clamp(value, 0, d.SectionCount - 1);
            }
        }
    }

    public List<LineSegment> FingerPaint { get => fingerPaint; }

    public void AddFingerPaint(float ax, float ay, float bx, float by, float hue)
    {
        lock (Mutex)
        {
            var s = new LineSegment
            {
                A = new PointF(ax, ay),
                B = new PointF(bx, by),
                Hue = hue,
                Stamp = timer.Elapsed.TotalSeconds,
                Life = 1
            };
            fingerPaint.Add(s);
            Effect = "fingerpaint";
        }
    }

    public int Line
    {
        get => line;
        set { lock (Mutex) line = Math.Clamp(value, 0, 1); }
    }

    public bool Running
    {
        get => running;
        set
        {
            lock (Mutex)
                running = value;
        }
    }

    public Color Color
    {
        get => color;
        set
        {
            lock (Mutex)
            {
                effect = "solid";
                color = value;
            }
        }
    }

    public double Time0
    {
        get { lock (Mutex) return time0; }
        set { lock (Mutex) time0 = value; }
    }

    public double Time1
    {
        get { lock (Mutex) return time1; }
        set { lock (Mutex) time1 = value; }
    }

    public double Sync
    {
        get { lock (Mutex) return sync; }
        set { lock (Mutex) sync = value; }
    }

    public float Intensity
    {
        get => Math.Clamp(intensity, 0, lightmax);
        set { lock (Mutex) intensity = Math.Clamp(value, 0, lightmax); }
    }

    public float Speed
    {
        get => speed;
        set { lock (Mutex) speed = Math.Clamp(value, -5, 5); }
    }

    public AudioVisuals Visuals
    {
        get => visuals;
        set
        {
            lock (Mutex)
            {
                visuals = value;
                if (visualSource == AudioVisualSource.Microphone && visuals != AudioVisuals.None)
                    AudioEngine.OpenMic();
                else
                    AudioEngine.CloseMic();
            }
        }
    }

    public AudioVisualSource VisualSource
    {
        get => visualSource;
        set
        {
            lock (Mutex)
            {
                visualSource = value;
                if (visualSource == AudioVisualSource.Microphone && visuals != AudioVisuals.None)
                    AudioEngine.OpenMic();
                else
                    AudioEngine.CloseMic();
            }
        }
    }

    public bool Off
    {
        get => off;
        set { lock (Mutex) off = value; }
    }

    public string Effect
    {
        get => effect;
        set
        {
            lock (Mutex)
            {
                Shuffle("");
                effect = value;
                off = effect == "off";
            }
        }
    }

    /* volumes are locked on read because they are not copied on assign */

    public float MasterVolume
    {
        get { lock (Mutex) return masterVolume; }
        set { lock (Mutex) masterVolume = value; }
    }

    private static void RunCommand(string command)
    {
        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "/bin/bash",
                Arguments = $"-c \"{command}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };

        process.Start();
        process.WaitForExit();
    }

    public float MusicVolume
    {
        get { lock (Mutex) return musicVolume; }
        set
        {
            value = Math.Clamp(value, 0, 100);
            lock (Mutex)
                musicVolume = value;
            RunCommand($"pactl set-sink-volume @DEFAULT_SINK@ {(int)value}%");
        }
    }

    public void Shuffle(string effects)
    {
        lock (Mutex)
        {
            shuffleIndex++;
            if (string.IsNullOrEmpty(effects))
            {
                shuffle = [];
                return;
            }
            shuffle = effects.Split(",");
            if (shuffle.Length > 0)
                effect = shuffle[rand.Next(shuffle.Length)];
        }
    }

    public void LoadVolume()
    {
        lock (Mutex)
        {
            string f;
            float v;
            f = App.AppPath("private/master-volume");
            if (File.Exists(f))
                masterVolume = float.TryParse(File.ReadAllText(f), out v) ? v : masterVolume;
            f = App.AppPath("private/music-volume");
            if (File.Exists(f))
                musicVolume = float.TryParse(File.ReadAllText(f), out v) ? v : musicVolume;
            musicVolume = Math.Clamp(musicVolume, 0, 100);
            masterVolume = Math.Clamp(masterVolume, 0, 100);
            RunCommand($"pactl set-sink-volume @DEFAULT_SINK@ {(int)musicVolume}%");
        }
    }

    public void SaveVolume()
    {
        lock (Mutex)
        {
            string f;
            f = App.AppPath("private/master-volume");
            File.WriteAllText(f, masterVolume.ToString());
            f = App.AppPath("private/music-volume");
            File.WriteAllText(f, musicVolume.ToString());
        }
    }

    public void Load(int line = -1)
    {
        lock (Mutex)
        {
            string f;
            if (line > -1)
            {
                line = Math.Clamp(line, 0, 1);
                f = App.AppPath($"private/d{line}");
                if (File.Exists(f))
                    if (line == 0)
                        d0.FromString(File.ReadAllText(f));
                    else
                        d1.FromString(File.ReadAllText(f));
                return;
            }
            f = App.AppPath("private/d0");
            if (File.Exists(f))
                d0.FromString(File.ReadAllText(f));
            f = App.AppPath("private/d1");
            d1.FromString(File.ReadAllText(f));
            f = App.AppPath("private/intesity");
            if (File.Exists(f))
                f = File.ReadAllText(f);
            else
                f = "0.5";
            if (float.TryParse(f, out intensity))
                intensity = Math.Clamp(intensity, 0, 1);
            else
                intensity = 0.5f;
            f = App.AppPath("private/speed");
            if (File.Exists(f))
                f = File.ReadAllText(f);
            else
                f = "1";
            if (float.TryParse(f, out speed))
                speed = Math.Clamp(speed, -5, 5);
            else
                speed = 1;
            f = App.AppPath("private/visuals");
            if (File.Exists(f))
                f = File.ReadAllText(f);
            else
                f = "";
            if (!Enum.TryParse(f, out visuals))
                visuals = AudioVisuals.None;
            f = App.AppPath("private/visualsource");
            if (File.Exists(f))
                f = File.ReadAllText(f);
            else
                f = "";
            if (!Enum.TryParse(f, out visualSource))
                visualSource = AudioVisualSource.Music;
            if (visualSource == AudioVisualSource.Microphone && visuals != AudioVisuals.None)
                AudioEngine.OpenMic();
        }
    }

    public void Save(int line = -1)
    {
        lock (Mutex)
        {
            string f;
            if (line > 0)
            {
                line = Math.Clamp(line, 0, 1);
                f = App.AppPath($"private/d{line}");
                if (line == 0)
                    File.WriteAllText(f, d0.ToString());
                else
                    File.WriteAllText(f, d1.ToString());
            }
            f = App.AppPath($"private/d0");
            File.WriteAllText(f, d0.ToString());
            f = App.AppPath($"private/d1");
            File.WriteAllText(f, d1.ToString());
            f = App.AppPath($"private/intesity");
            File.WriteAllText(f, intensity.ToString());
            f = App.AppPath($"private/speed");
            File.WriteAllText(f, speed.ToString());
            f = App.AppPath("private/visuals");
            File.WriteAllText(f, visuals.ToString());
            f = App.AppPath("private/visualsource");
            File.WriteAllText(f, visualSource.ToString());
        }
    }

    public LightStrip D0 { get => d0; }
    public LightStrip D1 { get => d1; }
}