using System.Net;
using System.Net.Sockets;
using System.Text;

namespace Lights.Test;

[DefaultPage("/typescript/content/hardware.html")]
public class HardwarePage : PageHandler
{

    static void Telnet(string host, string command)
    {
        using var client = new TcpClient(host, 23);
        using var stream = client.GetStream();
        byte[] data = Encoding.UTF8.GetBytes(command + "\r");
        stream.Write(data, 0, data.Length);
    }

    static void Get(string addr, string request)
    {
        const string http = "http://";
        var s = $"{http}{addr}{request}";
        WriteLine($"GET {s}");
        using var client = new HttpClient();
        client.GetAsync(s).Wait();
    }

    static bool IsIPv4(string s) => IPAddress.TryParse(s, out var a) && a.AddressFamily == AddressFamily.InterNetwork;
    static int brightness = 4;

    void Projector(string command)
    {
        // Example: 192.168.88.1
        const string hardware = "/hardware/projector";
        var s = MapPath(hardware);
        if (!File.Exists(s))
        {
            WriteLine("no projector address");
            return;
        }
        s = IncludeReadDirect(hardware);
        if (string.IsNullOrWhiteSpace(s))
        {
            WriteLine("empty projector address");
            return;
        }
        s = s.Trim();
        if (!IsIPv4(s))
        {
            WriteLine("invalid projector address");
            return;
        }
        if (command == "turn-on")
            Get(s, "/api/v01/contentmgr/remote/power/on");
        else if (command == "turn-off")
            Get(s, "/api/v01/contentmgr/remote/power/off");
        else if (command == "darken")
        {
            brightness--;
            if (brightness < 0)
                brightness = 0;
            Get(s, "api/v01/control/escvp21?cmd=LUMINANCE+" + brightness);
        }
        else if (command == "brighten")
        {
            brightness++;
            if (brightness > 9)
                brightness = 9;
            Get(s, "api/v01/control/escvp21?cmd=LUMINANCE+" + brightness);
        }
        else if (command == "4-3")
        {
            Get(s, "api/v01/control/escvp21?cmd=ASPECT+10");
        }
        else if (command == "16-9")
        {
            Get(s, "api/v01/control/escvp21?cmd=ASPECT+20");
        }
    }

    void Receiver(string command)
    {
        const string hardware = "/hardware/receiver";
        var s = MapPath(hardware);
        if (!File.Exists(s))
        {
            WriteLine("no receiver address");
            return;
        }
        s = IncludeReadDirect(hardware);
        if (string.IsNullOrWhiteSpace(s))
        {
            WriteLine("empty projector address");
            return;
        }
        s = s.Trim();
        if (!IsIPv4(s))
        {
            WriteLine("invalid projector address");
            return;
        }
        if (command == "turn-on")
            Telnet(s, "PWON");
        else if (command == "turn-off")
            Telnet(s, "PWSTANDBY");
        else if (command == "volume-down")
            Telnet(s, "MVDOWN");
        else if (command == "volume-up")
            Telnet(s, "MVUP");
        else if (command == "mute")
            Telnet(s, "MUON");
        else if (command == "unmute")
            Telnet(s, "MUOFF");
    }

    void Kaleidescape(string command)
    {
        const string hardware = "/hardware/kaleidescape";
        var s = MapPath(hardware);
        if (!File.Exists(s))
        {
            WriteLine("no kaleidescape address");
            return;
        }
        s = FileReadText(IncludeReadDirect(hardware));
        if (string.IsNullOrWhiteSpace(s))
        {
            WriteLine("empty kaleidescape address");
            return;
        }
        s = s.Trim();
        if (!IsIPv4(s))
        {
            WriteLine("invalid kaleidescape address");
            return;
        }
        if (command == "turn-on")
            Telnet(s, "PWON");
        else if (command == "turn-off")
            Telnet(s, "PWSTANDBY");
        else if (command == "volume-down")
            Telnet(s, "MVDOWN");
        else if (command == "volume-up")
            Telnet(s, "MVUP");
        else if (command == "mute")
            Telnet(s, "MUON");
        else if (command == "unmute")
            Telnet(s, "MUOFF");

    }

    [Action("send-command")]
    public void SendCommand()
    {
        var section = Read("section");
        var command = Read("command");
        WriteLine($"SendCommand: {section} / {command}");
        if (section == "projector")
            Projector(command);
        else if (section == "receiver")
            Receiver(command);
        else if (section == "kaleidescape")
            Kaleidescape(command);
    }
}