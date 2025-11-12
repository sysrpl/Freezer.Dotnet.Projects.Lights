namespace Lights;

public static class Device
{
    public static readonly bool IsPi = IsRaspberryPi();

    static bool IsRaspberryPi() =>
        File.Exists("/proc/cpuinfo") &&
            File.ReadAllText("/proc/cpuinfo").Contains("raspberry pi", StringComparison.CurrentCultureIgnoreCase);
}
