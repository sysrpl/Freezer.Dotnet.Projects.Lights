namespace Lights.Hardware;

using System.Net.Sockets;
using System.Text;

public static class Receiver
{
    static string Command(string command, out bool success)
    {
        var address = HardwareMonitor.ReceiverAddress;
        var port = HardwareMonitor.ReceiverPort;
        var response = string.Empty;
        success = false;
        try
        {
            using var client = new TcpClient();
            var result = client.BeginConnect(address, port, null, null);
            success = result.AsyncWaitHandle.WaitOne(TimeSpan.FromSeconds(3));
            if (!success)
                return string.Empty;
            client.EndConnect(result);
            using var stream = client.GetStream();
            stream.ReadTimeout = 3000;
            stream.WriteTimeout = 3000;
            byte[] data = Encoding.UTF8.GetBytes(command + "\r");
            stream.Write(data, 0, data.Length);
            if (command.EndsWith("?"))
            {
                using var reader = new StreamReader(stream, Encoding.UTF8);
                try
                {
                    response = reader.ReadLine();
                    response = response?.Trim() ?? string.Empty;
                    success = !string.IsNullOrWhiteSpace(response);
                }
                catch
                {
                    success = false;
                }
            }
        }
        catch
        {
            success = false;
        }
        return response;
    }

    public static int Volume
    {
        get
        {
            var s = Command("MV?", out bool success);
            if (success && s.StartsWith("MV"))
            {
                s = s.Replace("MV", "");
                if (string.IsNullOrWhiteSpace(s))
                    return 0;
                return int.TryParse(s, out var result) ? result : 0;
            }
            else
                return 0;
        }
        set
        {
            int v = Math.Clamp(value, 0, 100);
            var command = $"MV{value:00}";
            Command(command, out _);
        }
    }

    public static string Source
    {
        get
        {
            var s = Command("SI?", out bool success);
            return success ? s : string.Empty;
        }
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                return;
            Command($"SI{value.Trim()}", out _);
        }
    }

    private static readonly object mutex = new();
    private static bool muted = false;

    public static bool Muted
    {

        get
        {
            lock(mutex)
                return muted;
        }
        set
        {
            lock(mutex)
            {
                if (value != muted)
                {
                    muted = value;
                    if (muted)
                        Mute();
                    else
                        Unmute();
                }
            }

        }

    }

    static void Mute() => Command($"MUON", out _);
    static void Unmute() => Command($"MUOFF", out _);
}
