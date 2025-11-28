namespace Lights.Hardware;

public static class HardwareMonitor
{
    public static readonly bool IsReal;
    public static readonly string ProjectorAddress;
    public static readonly int ProjectorPort;
    public static readonly string ReceiverAddress;
    public static readonly int ReceiverPort;
    public static readonly string KaleidescapeAddress;
    public static readonly int KaleidescapePort;

    static HardwareMonitor()
    {
        var path = App.AppPath("private");
        IsReal = File.Exists(Path.Combine(path, "isreal"));
        var lines = File.ReadAllLines(Path.Combine(path, "hardware-projector"));
        var line = IsReal ? lines[0] : lines[1];
        var parts = line.Split(':');
        ProjectorAddress = parts[0];
        ProjectorPort = int.Parse(parts[1]);
        lines = File.ReadAllLines(Path.Combine(path, "hardware-receiver"));
        line = IsReal ? lines[0] : lines[1];
        parts = line.Split(':');
        ReceiverAddress = parts[0];
        ReceiverPort = int.Parse(parts[1]);
        lines = File.ReadAllLines(Path.Combine(path, "hardware-kaleidescape"));
        line = IsReal ? lines[0] : lines[1];
        parts = line.Split(':');
        KaleidescapeAddress = parts[0];
        KaleidescapePort = int.Parse(parts[1]);
    }

    public static void Start() => _ = Watch();
    static readonly object mutex = new();

    public static bool Muted
    {
        get
        {
            lock (mutex)
                return muted;
        }
        set
        {
            lock (mutex)
            {
                Receiver.Muted = value;
                muted = value;
            }
            Program.Events.Broadcast("muted", value.ToString().ToLower());
        }
    }

    public static bool Powered
    {
        get
        {
            lock (mutex)
                return powered;
        }
        set
        {
            lock (mutex)
            {
                Projector.Powered = value;
                powered = value;
            }
            Program.Events.Broadcast("powered", value.ToString().ToLower());
        }
    }

    public static int Volume
    {
        get
        {
            lock (mutex)
                return volume;
        }
        set
        {
            value = Math.Clamp(value, 0, 100);
            lock (mutex)
            {
                Receiver.Volume = value;
                volume = value;
            }
            Program.Events.Broadcast("volume", value.ToString().ToLower());
        }
    }

    static bool muted = false;
    static async Task SetMuted(bool value)
    {
        var changed = false;
        lock (mutex)
            if (value != muted)
            {
                muted = value;
                changed = true;
            }
        if (changed)
            await Program.Events.BroadcastAsync("mute", value.ToString().ToLower());
    }

    static bool powered = false;
    static async Task SetPowered(bool value)
    {
        var changed = false;
        lock (mutex)
            if (value != powered)
            {
                powered = value;
                changed = true;
            }
        if (changed)
            await Program.Events.BroadcastAsync("powered", value.ToString());
    }

    static int volume = -1;
    static async Task SetVolume(int value)
    {
        var changed = false;
        lock (mutex)
            if (value != volume)
            {
                volume = value;
                changed = true;
            }
        if (changed)
            await Program.Events.BroadcastAsync("volume", value.ToString());
    }

    static async Task Watch()
    {
        long timer = 0;
        var token = App.StopToken;
        try
        {
            while (!token.IsCancellationRequested)
            {
                await Task.Delay(1000, token);
                if (token.IsCancellationRequested)
                    return;
                Kaleidescape.Status();
                if (timer % 10 == 0)
                {
                    await SetMuted(Receiver.Muted);
                    await SetPowered(Projector.Powered);
                    await SetVolume(Receiver.Volume);
                }
                timer++;
            }
        }
        catch
        {
        }
    }
}