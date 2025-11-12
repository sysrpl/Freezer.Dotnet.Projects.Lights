using System.Drawing;

namespace Lights.Test;

[DefaultPage("/typescript/content/test.html")]
public class TestPage : PageHandler
{
    enum Mode
    {
        Off,
        Red,
        Green,
        Blue,
        White,
        All
    }

    static readonly object mutex = new();
    static Mode mode = Mode.All;
    static float brightness = 0.5f;

    static Color FindColor(long index)
    {
        Color c = Color.Fuchsia;
        switch (mode)
        {
            case Mode.Red:
                c = Color.Red;
                break;
            case Mode.Green:
                c = Color.Green;
                break;
            case Mode.Blue:
                c = Color.Blue;
                break;
            case Mode.White:
                c = Color.White;
                break;
            case Mode.All:
                long i = index % 40;
                if (i < 10)
                    c = Color.Red;
                else if (i < 20)
                    c = Color.Green;
                else if (i < 30)
                    c = Color.Blue;
                else
                    c = Color.White;
                break;
            default:
                return Color.Black;
        }
        return c.Lightness(brightness);
    }

    public static void LightThread()
    {
        const int count = 2500;
        const int bus = 0;
        using NeoPixelStrip pixels = new(count, bus);
        for (var i = 0; i < 10; i++)
        {
            Color blink = i % 2 == 0 ? Color.White : Color.Black;
            foreach (var p in pixels)
                p.Color = blink;
            pixels.Update();
            Sleep(500);
        }
        long index = 5000;
        var lastMode = mode;
        while (index > 0)
            lock (mutex)
            {
                if (mode == lastMode && mode == Mode.Off)
                {
                    Sleep(50);
                    continue;
                }
                index++;
                for (var i = 0; i < count; i++)
                {
                    var p = pixels[i];
                    if (mode == Mode.All)
                        p.Color = FindColor(Math.Abs(index - i));
                    else if ((index - i) % 10 > 5)
                        p.Color = FindColor(0);
                    else
                        p.Color = Color.Black;
                }
                pixels.Update();
                if (mode != lastMode)
                {
                    lastMode = mode;
                    WriteLine($"Mode change: {mode}");
                }
                Sleep(50);
            }
    }

    [Action("light")]
    public void Light()
    {
        lock (mutex)
        {
            mode = (Mode)ReadInt("mode");
            brightness = ReadInt("brightness") / 100f;
        }
        WriteLine($"mode = {ReadInt("mode")}, brightness = {ReadInt("brightness")}");
        Write("OK");
    }

    /*public static void Main(string[] args)
    {
    }*/
}