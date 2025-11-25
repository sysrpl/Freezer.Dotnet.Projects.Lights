namespace Lights.Hardware;

using System.Net.Sockets;
using System.Text;

public static class Projector
{
    static string Command(string command, out bool success)
    {
        string address = HardwareMonitor.ProjectorAddress;
        int port = HardwareMonitor.ProjectorPort;
        try
        {

            using var client = new TcpClient();
            var result = client.BeginConnect(address, port, null, null);
            success = result.AsyncWaitHandle.WaitOne(TimeSpan.FromSeconds(1));
            if (!success)
                return string.Empty;
            client.EndConnect(result);
            Sleep(10);
            using var stream = client.GetStream();
            stream.ReadTimeout = 1000;
            stream.WriteTimeout = 1000;
            using var reader = new StreamReader(stream, Encoding.ASCII);
            byte[] data = Encoding.ASCII.GetBytes(command + "\r");
            stream.Write(data, 0, data.Length);
            string response = reader.ReadLine();
            response = response?.Trim() ?? string.Empty;
            Sleep(10);
            stream.Write(data, 0, data.Length);
            if (command.Contains('?'))
            {
                response = reader.ReadLine();
                response = response?.Trim() ?? string.Empty;
            }
            else
                response = string.Empty;
            return response;
        }
        catch
        {
            success = false;
            return string.Empty;
        }
    }

    static public bool Powered
    {
        get
        {
            var s = Command("%1POWR ?", out var b);
            return b && s == "%1POWR=1";
        }
        set
        {
            if (value)
                Command("%1POWR 1", out _);
            else
                Command("%1POWR 0", out _);
        }
    }
}