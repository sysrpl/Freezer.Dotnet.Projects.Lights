using System.Data.Common;
using System.Drawing;
using System.Text.Json;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Lights.Test;

[DefaultPage("/typescript/content/strip.html")]
public class StripPage : PageHandler
{
    static readonly object mutex = new();

    class StripItem
    {
        public int index { get; set; }
        public int count { get; set; }
    }

    enum Mode
    {
        Pattern,
        Item,
        Off
    }
    static Mode mode = Mode.Pattern;
    static int current = 0;
    static float brightness = 0.25f;

    static Color FindColor(long index)
    {
        var c = Color.Black;
        long i = index % 40;
        if (i < 10)
            c = Color.Red;
        else if (i < 20)
            c = Color.Green;
        else if (i < 30)
            c = Color.Blue;
        else
            c = Color.White;
        return c;
    }


    static readonly List<StripItem> items;
    static readonly Color[] colors = [Color.Red, Color.Green, Color.Blue, Color.Yellow, Color.Fuchsia, Color.Teal];

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
        try
        {
            var last = mode;
            while (index > 0)
            {
                if (last != mode)
                {
                    WriteLine($"new mode = {mode}");
                    last = mode;
                }

                var item = 0;
                var section = 0;
                var color = colors[section % colors.Length];
                for (var i = 0; i < count; i++)
                {
                    var p = pixels[i];
                    if (mode == Mode.Off)
                    {
                        color = Color.Black;
                    }
                    else if (mode == Mode.Pattern)
                    {
                        color = FindColor(i + index);
                    }
                    else if (section >= items.Count)
                        color = Color.Black;
                    else if (item > items[section].count)
                    {
                        item = 0;
                        section++;
                        if (section > items.Count - 1)
                            color = Color.Black;
                        else
                            color = colors[section % colors.Length];
                    }
                    else
                        item++;
                    p.Color = color;
                    if (current != section && mode == Mode.Item)
                        if ((index - i) % 10 > 5)
                            p.Color = Color.Black;
                    if (p.Color != Color.Black)
                        p.Color = p.Color.Lightness(brightness);
                }
                pixels.Update();
                if (mode == Mode.Off)
                    Sleep(500);
                else
                    Sleep(10);
                index++;
            }
        }
        catch (Exception e)
        {
            WriteLine("Ended premature");
            WriteLine(e.ToString());
            WriteLine(e.StackTrace);
        }
    }

    static StripPage()
    {
        var filename = App.AppPath("private/strip.json");
        var json = File.ReadAllText(filename);
        items = JsonSerializer.Deserialize<List<StripItem>>(json);
    }

    [Action("set-mode")]
    public void SetMode()
    {
        switch (ReadInt("mode"))
        {
            case 0:
                mode = Mode.Pattern;
                break;
            case 1:
                mode = Mode.Item;
                break;
            default:
                mode = Mode.Off;
                break;
        }
    }

    [Action("set-brightness")]
    public void SetBrightness()
    {
        var b = ReadInt("brightness") / 1000f;
        brightness = Math.Clamp(b, 0f, 1f);
    }

    [Action("set-item")]
    public void SetItem()
    {
        var index = ReadInt("index");
        var count = ReadInt("count");
        if (index > -1 && index < items.Count)
            items[index].count = count;
        var filename = App.AppPath("private/strip.json");
        var json = JsonSerializer.Serialize(items);
        File.WriteAllText(filename, json);
        current = index;
        mode = Mode.Item;
    }

    [Action("get-items")]
    public void GetItems()
    {
        Write(JsonSerializer.Serialize(items));
    }

    [Action("slide")]
    public void Slide()
    {
        lock (mutex)
        {
        }
        Write("OK");
    }
}