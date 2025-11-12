using System.Diagnostics;
using System.Drawing;

namespace Lights;

public enum SleepMode
{
    Minutes15,
    Minutes30,
    Hours1,
    Hours4,
    Hours6,
    Never
}

public static class SleepMonitor
{
    static readonly object mutex = new();
    static Stopwatch stopwatch = null;
    static SleepMode mode = SleepMode.Hours1;
    static bool sleeping = false;

    static void Watch()
    {
        const int delay = 1000 * 60;
        while (true)
        {
            Sleep(delay);
            lock (mutex)
            {
                if (sleeping) continue;
                switch (mode)
                {
                    case SleepMode.Minutes15:
                        if (stopwatch.Elapsed.TotalMinutes > 14)
                            sleeping = true;
                        break;
                    case SleepMode.Minutes30:
                        if (stopwatch.Elapsed.TotalMinutes > 29)
                            sleeping = true;
                        break;
                    case SleepMode.Hours1:
                        if (stopwatch.Elapsed.TotalMinutes > 59)
                            sleeping = true;
                        break;
                    case SleepMode.Hours4:
                        if (stopwatch.Elapsed.TotalMinutes > 239)
                            sleeping = true;
                        break;
                    case SleepMode.Hours6:
                        if (stopwatch.Elapsed.TotalMinutes > 359)
                            sleeping = true;
                        break;
                }
                if (sleeping)
                    HomePage.StaticStop();
            }
        }
    }

    public static SleepMode Mode
    {
        get
        {
            lock (mutex) return mode;
        }
        set
        {
            lock (mutex)
            {
                if (mode == value)
                    return;
                mode = value;
                var s = App.AppPath("private/sleep");
                File.WriteAllText(s, mode.ToString());
            }
        }
    }

    public static void Touch()
    {
        lock (mutex)
        {
            if (stopwatch == null)
            {
                var s = App.AppPath("private/sleep");
                if (File.Exists(s))
                    s = File.ReadAllText(s);
                else
                    s = "";
                if (!Enum.TryParse(s, out mode))
                    mode = SleepMode.Minutes30;
                stopwatch = new Stopwatch();
                stopwatch.Start();
                Task.Run(Watch);
                return;
            }
            stopwatch.Restart();
            sleeping = false;
        }
    }
}