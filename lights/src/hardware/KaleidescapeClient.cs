namespace Lights.Hardware;

using System;
using System.Diagnostics;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

public class KaleidescapeClient : IDisposable
{
    private TcpClient client;
    private NetworkStream stream;
    private int sequenceId = 1;
    private readonly SemaphoreSlim writeLock = new(1, 1);
    private CancellationTokenSource cancel;
    private CancellationToken token;

    public event EventHandler OnConnect;
    public event EventHandler OnDisconnect;
    public event EventHandler OnTimeout;
    public event EventHandler<string> OnMessage;
    public event EventHandler OnWait;

    public bool IsConnected => client?.Connected ?? false;

    public async Task ConnectAsync(string host, int port = 10000)
    {
        const int timeout = 3000;
        client = new TcpClient();
        using (var connect = new CancellationTokenSource(timeout))
        {
            try
            {
                await client.ConnectAsync(host, port).WaitAsync(connect.Token);
            }
            catch
            {
                client?.Dispose();
                client = null;
                OnTimeout?.Invoke(this, EventArgs.Empty);
                return;
            }
        }
        OnConnect?.Invoke(this, EventArgs.Empty);
        cancel = new CancellationTokenSource();
        token = CancellationTokenSource.CreateLinkedTokenSource(cancel.Token, App.StopToken).Token;
        stream = client.GetStream();
        await ReadLoopAsync();
    }

    public Stopwatch timer;

    public void SendCommand(int deviceId, string command, string parameters = "")
    {
        if (timer == null)
        {
            timer = Stopwatch.StartNew();
            _ = SendCommandAsync(deviceId, "LEAVE_STANDBY");
            Sleep(10);
        }
        if (timer.Elapsed.TotalMinutes > 15)
        {
            _ = SendCommandAsync(deviceId, "LEAVE_STANDBY");
            Sleep(10);
        }
        _ = SendCommandAsync(deviceId, command, parameters);
        timer.Reset();
    }

    public async Task SendCommandAsync(int deviceId, string command, string parameters = "")
    {
        // Get next sequence ID (wraps from 9 to 1)
        int seqId = GetNextSequenceId();
        if (!IsConnected)
            return;
        // Build message: 01/5/PLAY:
        // Device ID is zero-padded
        if (!string.IsNullOrEmpty(parameters))
            parameters += ":";
        string message = $"{deviceId:D2}/{seqId}/{command}:{parameters}\r\n";
        byte[] data = Encoding.ASCII.GetBytes(message);
        // Thread-safe write
        await writeLock.WaitAsync(token);
        try
        {
            await stream.WriteAsync(data, 0, data.Length, token);
        }
        finally
        {
            writeLock.Release();
        }
    }

    private int GetNextSequenceId()
    {
        int current = Interlocked.Increment(ref sequenceId);
        // Wrap from 9 back to 1
        if (current > 9)
        {
            Interlocked.CompareExchange(ref sequenceId, 1, current);
            return 1;
        }
        return current;
    }

    private async Task ReadLoopAsync()
    {
        byte[] buffer = new byte[4096];
        var messageBuilder = new StringBuilder();
        DateTime lastLineReadTime = DateTime.MinValue;
        bool waitEventFired = true;
        // Start a monitoring task
        var monitorTask = Task.Run(async () =>
        {
            while (!token.IsCancellationRequested)
            {
                await Task.Delay(10, token);
                if (lastLineReadTime != DateTime.MinValue &&
                    !waitEventFired &&
                    (DateTime.UtcNow - lastLineReadTime).TotalSeconds >= 0.2)
                {
                    OnWait?.Invoke(this, EventArgs.Empty);
                    waitEventFired = true;
                }
            }
        }, token);

        try
        {
            while (!token.IsCancellationRequested && stream != null)
            {
                int bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length, token);
                if (bytesRead == 0)
                {
                    // Connection closed
                    break;
                }

                string data = Encoding.ASCII.GetString(buffer, 0, bytesRead);
                messageBuilder.Append(data);

                // Process complete messages (lines ending with \r\n)
                string accumulated = messageBuilder.ToString();
                int lineEnd;
                bool foundLine = false;

                while ((lineEnd = accumulated.IndexOf("\r\n")) >= 0)
                {
                    string message = accumulated.Substring(0, lineEnd);
                    accumulated = accumulated.Substring(lineEnd + 2);

                    // Fire event with complete message
                    OnMessage?.Invoke(this, message);
                    foundLine = true;
                }

                // Update tracking if we found at least one line
                if (foundLine)
                {
                    lastLineReadTime = DateTime.UtcNow;
                    waitEventFired = false;
                }

                messageBuilder.Clear();
                messageBuilder.Append(accumulated);
            }
        }
        catch
        {
        }
        cancel.Cancel();
        OnDisconnect?.Invoke(this, EventArgs.Empty);
    }

    public void Disconnect()
    {
        cancel?.Cancel();
        stream?.Close();
        client?.Close();
    }

    public void Dispose()
    {
        Disconnect();
        stream?.Dispose();
        client?.Dispose();
        cancel?.Dispose();
        writeLock?.Dispose();
    }
}