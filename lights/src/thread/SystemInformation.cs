using System.Diagnostics;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Reflection;

namespace Lights;

public class ProcessMetrics
{
    public string Version { get; set; }
    public string Date { get; set; }
    public double MemoryUsage { get; set; }
    public int Threads { get; set; }
    public double CpuUsage { get; set; }
    public string Uptime { get; set; }
    public int DataCount0 { get; set; }
    public double DataTime0 { get; set; }
    public int DataCount1 { get; set; }
    public double DataTime1 { get; set; }
    public string NetworkAddress { get; set; }
    public double NetworkSent { get; set; }
    public double NetworkReceived { get; set; }
}

public static class SystemInformation
{

    private static DateTime _lastMeasurement = DateTime.MinValue;
    private static DateTime _lastCheckTime = DateTime.Now;
    private static TimeSpan _lastTotalProcessorTime = TimeSpan.Zero;

    public static double GetCurrentCpuUsage()
    {
        var currentProcess = Process.GetCurrentProcess();
        var currentTime = DateTime.UtcNow;
        var currentTotalProcessorTime = currentProcess.TotalProcessorTime;

        // First call - return 0 since we need a baseline
        if (_lastMeasurement == DateTime.MinValue)
        {
            _lastMeasurement = currentTime;
            _lastTotalProcessorTime = currentTotalProcessorTime;
            return 0.0;
        }

        // Calculate the time difference
        var timeDiff = (currentTime - _lastMeasurement).TotalMilliseconds;
        var cpuDiff = (currentTotalProcessorTime - _lastTotalProcessorTime).TotalMilliseconds;

        // Calculate CPU usage percentage of total system capacity (all cores)
        var cpuUsagePercentage = (cpuDiff / (Environment.ProcessorCount * timeDiff)) * 100.0;

        // Update for next measurement
        _lastMeasurement = currentTime;
        _lastTotalProcessorTime = currentTotalProcessorTime;

        return cpuUsagePercentage;
    }

    private static long _initialBytesSent = 0;
    private static long _initialBytesReceived = 0;
    private static bool _networkInitialized = false;

    /// <summary>
    /// Gets the IP address of the primary network interface
    /// Tries common names: eth0, ens33, enp0s3, etc., or finds the first active non-loopback interface
    /// </summary>
    private static string GetPrimaryNetworkIPAddress()
    {
        try
        {
            NetworkInterface[] interfaces = NetworkInterface.GetAllNetworkInterfaces();
            // Common network interface names to try first
            string[] commonNames = { "eth0", "eth1", "ens33", "enp0s3", "enp0s8", "eno1", "wlan0" };
            // Try common names first
            foreach (string name in commonNames)
            {
                NetworkInterface ni = interfaces.FirstOrDefault(i => i.Name == name && i.OperationalStatus == OperationalStatus.Up);
                if (ni != null)
                {
                    string ip = GetInterfaceIPv4(ni);
                    if (ip != null)
                        return $"{ip} ({ni.Name})";
                }
            }
            // If no common name found, find first active non-loopback interface with an IP
            foreach (NetworkInterface ni in interfaces)
            {
                if (ni.NetworkInterfaceType == NetworkInterfaceType.Loopback)
                    continue;
                if (ni.OperationalStatus != OperationalStatus.Up)
                    continue;
                string ip = GetInterfaceIPv4(ni);
                if (ip != null)
                    return $"{ip} ({ni.Name})";
            }
            return "No active network interface found";
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    /// <summary>
    /// Helper to get IPv4 address from a network interface
    /// </summary>
    private static string GetInterfaceIPv4(NetworkInterface ni)
    {
        try
        {
            IPInterfaceProperties ipProps = ni.GetIPProperties();
            var ipv4Address = ipProps.UnicastAddresses
                .FirstOrDefault(addr => addr.Address.AddressFamily == AddressFamily.InterNetwork);
            return ipv4Address?.Address.ToString();
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Returns a formatted string containing process metrics:
    /// Memory usage, thread count, CPU usage, uptime, and network activity
    /// </summary>
    public static ProcessMetrics GetMetrics()
    {
        using Process currentProcess = Process.GetCurrentProcess();
        var m = new ProcessMetrics();
        var assembly = Assembly.GetExecutingAssembly();
        m.Version = assembly.GetName().Version?.ToString();
        m.Date = $"{File.GetLastWriteTime(assembly.Location):M/d/yy}";
        // Refresh to get latest values
        currentProcess.Refresh();
        // Memory usage (Working Set in MB)
        m.MemoryUsage = currentProcess.WorkingSet64 / (1024.0 * 1024.0);
        // Number of active threads
        m.Threads = currentProcess.Threads.Count;
        // CPU usage calculation
        m.CpuUsage = GetCurrentCpuUsage(); // CalculateCpuUsage(currentProcess);
        // Time active (uptime)
        m.Uptime = FormatTimeSpan(DateTime.Now - currentProcess.StartTime);
        // Network activity
        var networkStats = GetNetworkActivity();
        m.NetworkSent = networkStats.sentMB;
        m.NetworkReceived = networkStats.receivedMB;
        m.NetworkAddress = GetPrimaryNetworkIPAddress();
        var s = LightState.Current;
        m.DataCount0 = s.D0.LightCount;
        m.DataTime0 = s.Time0;
        m.DataCount1 = s.D1.LightCount;
        m.DataTime1 = s.Time1;
        return m;
    }

    /// <summary>
    /// Gets network activity (sent and received) since program start
    /// </summary>
    private static (double sentMB, double receivedMB, double totalMB) GetNetworkActivity()
    {
        try
        {
            // Get all network interfaces
            NetworkInterface[] interfaces = NetworkInterface.GetAllNetworkInterfaces();

            long currentBytesSent = 0;
            long currentBytesReceived = 0;

            // Sum up all network interface statistics
            foreach (NetworkInterface ni in interfaces)
            {
                // Skip loopback and inactive interfaces
                if (ni.NetworkInterfaceType == NetworkInterfaceType.Loopback ||
                    ni.OperationalStatus != OperationalStatus.Up)
                    continue;

                IPv4InterfaceStatistics stats = ni.GetIPv4Statistics();
                currentBytesSent += stats.BytesSent;
                currentBytesReceived += stats.BytesReceived;
            }

            // Initialize baseline on first call
            if (!_networkInitialized)
            {
                _initialBytesSent = currentBytesSent;
                _initialBytesReceived = currentBytesReceived;
                _networkInitialized = true;
            }

            // Calculate bytes since program start
            long bytesSent = currentBytesSent - _initialBytesSent;
            long bytesReceived = currentBytesReceived - _initialBytesReceived;

            // Convert to MB
            double sentMB = bytesSent / (1024.0 * 1024.0);
            double receivedMB = bytesReceived / (1024.0 * 1024.0);
            double totalMB = sentMB + receivedMB;

            return (sentMB, receivedMB, totalMB);
        }
        catch
        {
            // If network statistics aren't available, return zeros
            return (0.0, 0.0, 0.0);
        }
    }

    /// <summary>
    /// Calculates CPU usage percentage by comparing processor time between calls
    /// </summary>
    private static double CalculateCpuUsage(Process process)
    {
        DateTime currentTime = DateTime.Now;
        TimeSpan currentTotalProcessorTime = process.TotalProcessorTime;

        // Calculate elapsed time and processor time since last check
        double elapsedMs = (currentTime - _lastCheckTime).TotalMilliseconds;
        double processorMs = (currentTotalProcessorTime - _lastTotalProcessorTime).TotalMilliseconds;

        // Update for next calculation
        _lastCheckTime = currentTime;
        _lastTotalProcessorTime = currentTotalProcessorTime;

        // Avoid division by zero on first call
        if (elapsedMs == 0)
            return 0.0;

        // CPU usage as percentage (accounting for multiple cores)
        double cpuPercentage = (processorMs / elapsedMs) * 100.0;

        return cpuPercentage;
    }

    /// <summary>
    /// Formats a TimeSpan into a readable string
    /// </summary>
    private static string FormatTimeSpan(TimeSpan ts)
    {
        if (ts.TotalDays >= 1)
            return $"{(int)ts.TotalDays}d {ts.Hours}h {ts.Minutes}m {ts.Seconds}s";
        else if (ts.TotalHours >= 1)
            return $"{(int)ts.TotalHours}h {ts.Minutes}m {ts.Seconds}s";
        else if (ts.TotalMinutes >= 1)
            return $"{ts.Minutes}m {ts.Seconds}s";
        else
            return $"{ts.Seconds}s";
    }
}
