using System.Net;
using System.Net.Sockets;

namespace Lights;

public static class TestSocket
{
    static readonly object mutex = new();
    static Socket socket = null;
    static string host = "";
    static bool connected = false;
    const int port = 15016;

    public static void Disconnect()
    {
        lock (mutex)
        {
            connected = false;
            socket?.Close();
            socket = null;
        }
    }

    public static void Connect(string address)
    {
        lock (mutex)
        {
            Disconnect();
            host = address;
            connected = true;
            try
            {
                socket = new(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp)
                {
                    SendTimeout = 100
                };
                var result = socket.BeginConnect(IPAddress.Parse(host), port, null, null);
                bool success = result.AsyncWaitHandle.WaitOne(TimeSpan.FromMilliseconds(500));
                if (!success)
                {
                    Disconnect();
                    return;
                }
                socket.EndConnect(result);
            }
            catch
            {
                Disconnect();
            }
        }
    }

    public static string Host
    {
        get
        {
            lock (mutex)
                return host;
        }
        set
        {
            lock (mutex)
            {
                Disconnect();
                host = value;
            }
        }
    }

    public static bool Connected
    {
        get
        {
            lock (mutex)
                return connected;
        }
        set
        {
            lock (mutex)
                if (value)
                    Connect(host);
                else
                    Disconnect();
        }
    }


    public static void Send(byte[] data)
    {
        Socket s = null;
        lock (mutex)
        {
            if (!connected || socket == null || !socket.Connected)
            {
                Disconnect();
                return;
            }
            s = socket;
        }
        try
        {
            s.Send(data);
        }
        catch (Exception e)
        {
            Disconnect();
            WriteLine("disconnect at send");
            if (e is SocketException)
            {
                var message = e as SocketException;
                WriteLine($"  with error code {message.ErrorCode}");
            }
        }
    }
}