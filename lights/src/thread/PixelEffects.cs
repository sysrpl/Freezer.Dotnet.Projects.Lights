using System.Diagnostics;
using System.Drawing;
using System.Text;

namespace Lights;

public class PixelEffects : PixelBase
{
    public void Solid()
    {
        foreach (var p in Pixels)
            p.Color = State.Color;
        Sleep(250);
    }

    static float Scaled(float v, float a, float b)
    {
        if (a == b)
            return 0f;
        float result = (v - a) / (b - a);
        return Math.Clamp(result, 0f, 1f);
    }

    static readonly Stopwatch wavetime = Stopwatch.StartNew();
    static readonly List<double> waveitems = [];
    static double maxwave = 0;
    static readonly object wait = new();
    static long time = 0;

    static PixelEffects()
    {
        for (int i = 0; i < 60; i++)
            waveitems.Add(0);
    }

    public PixelEffects(int dataLine, bool fake) : base(dataLine, fake) { }

    public void DrawVisuals(Visualizer data)
    {
        float scaling = 0.5f;
        AudioVisuals visuals;
        lock (wait)
        {
            visuals = State.Visuals;
            var next = (long)(wavetime.Elapsed.TotalSeconds * 60);
            var v = Math.Max(data.Volume[0], data.Volume[1]);
            maxwave = Math.Max(maxwave, v);
            if (next > time)
            {
                time = next;
                waveitems.Insert(0, maxwave);
                waveitems.RemoveAt(waveitems.Count - 1);
                maxwave = 0;
            }
        }
        var line = Line;
        var width = LightCoords.Width;
        var height = LightCoords.Height;
        var volume = Math.Clamp(data.Volume[line] / scaling, 0, 1);
        var a = width / 2f;
        var b = 10f;
        if (line > 0)
            b = width - 10f;
        var coord = new PointF();
        var buckCount = data.Graph.Length;

        Color Histogram()
        {
            var bucket = (int)(coord.X / width * buckCount);
            if (bucket > buckCount - 1)
                bucket = buckCount - 1;
            var m = Math.Clamp(data.Graph[bucket] / scaling, 0, 1);
            var y = 1 - coord.Y / height;
            if (y > m)
                return Color.Black;
            if (m < 0.2)
                return Color.Blue;
            if (m < 0.6)
                return Mix(Color.Blue, Color.Lime, (m - 0.2) / 0.4);
            if (m < 0.9)
                return Mix(Color.Lime, Color.Red, (m - 0.6) / 0.3);
            return Color.Red;
        }

        Color Levels()
        {
            var m = Scaled(coord.X, a, b);
            if (m > volume)
                return Color.Black;
            if (m < 0.5)
                return Mix(Color.Blue, Color.Lime, m / 0.5);
            else
                return Mix(Color.Lime, Color.Red, (m - 0.5f) / 0.5f);
        }

        Color Cloud()
        {
            if (volume < 0.2)
                return Color.Black;
            if (volume < 0.4)
                return Mix(Color.Black, Color.Blue, Scaled(volume, 0.2f, 0.4f));
            else if (volume < 0.6)
                return Mix(Color.Blue, Color.Fuchsia, Scaled(volume, 0.4f, 0.6f));
            else
                return Mix(Color.Fuchsia, Color.Red, Scaled(volume, 0.6f, 0.8f));
        }

        Color Wave()
        {
            const double scale = 2;
            var index = (int)(coord.X / width * waveitems.Count);
            index = Math.Clamp(index, 0, waveitems.Count - 1);
            var level = (float)(waveitems[index] * scale);
            if (level < 0.15)
                return Color.Black;
            if (level < 0.4)
                return Mix(Color.Black, Color.Blue, Scaled(level, 0.15f, 0.4f));
            if (level < 0.6)
                return Mix(Color.Blue, Color.Lime, Scaled(level, 0.4f, 0.6f));
            if (level < 0.9)
                return Mix(Color.Lime, Color.Red, Scaled(level, 0.6f, 0.9f));
            return Color.Red;
        }

        Func<Color> draw;
        switch (visuals)
        {
            case AudioVisuals.Histogram:
                draw = Histogram;
                break;
            case AudioVisuals.Levels:
                draw = Levels;
                break;
            case AudioVisuals.Cloud:
                draw = Cloud;
                break;
            case AudioVisuals.Wave:
                draw = Wave;
                break;
            default:
                Pixels.Reset();
                return;
        }
        var index = 0;
        foreach (var p in Pixels)
        {
            coord = Coords[index++];
            p.Color = draw();
        }
    }

    static Stopwatch solidTime = Stopwatch.StartNew();
    static double solidStart = 0;
    static Color solidLast = Color.Red;
    static Color solidCurrent = Color.Blue;
    static long solidSecond = 0;

    static object mutex = new();

    public void RandomColors()
    {
        var t = solidTime.Elapsed.TotalSeconds;
        lock (mutex)
            if (t > solidSecond)
            {
                solidStart = t;
                solidSecond = (int)t + 30;
                solidLast = solidCurrent;
                var h = Next;
                var s = Next / 2 + 0.5;
                var l = Next / 2 + 0.2;
                solidCurrent = ColorRGB.FromHSL(h, s, l);
            }
        var delta = t - solidStart;
        var c = solidCurrent;
        if (delta < 1)
            c = Mix(solidLast, c, delta);
        foreach (var p in Pixels)
            p.Color = c;
    }

    public void FingerPaint()
    {

        static bool Near(PointF p, PointF a, PointF b, float d)
        {
            // Early rejection: check if point is outside expanded bounding box
            float minX = Math.Min(a.X, b.X) - d;
            float maxX = Math.Max(a.X, b.X) + d;
            float minY = Math.Min(a.Y, b.Y) - d;
            float maxY = Math.Max(a.Y, b.Y) + d;

            if (p.X < minX || p.X > maxX || p.Y < minY || p.Y > maxY)
                return false;

            // Point is inside bounding box, do precise distance check
            float abX = b.X - a.X;
            float abY = b.Y - a.Y;
            float apX = p.X - a.X;
            float apY = p.Y - a.Y;

            float abLengthSq = abX * abX + abY * abY;

            if (abLengthSq == 0)
                return apX * apX + apY * apY <= d * d;

            float t = (apX * abX + apY * abY) / abLengthSq;

            if (t < 0)
                t = 0;
            else if (t > 1)
                t = 1;

            float closestX = a.X + t * abX;
            float closestY = a.Y + t * abY;
            float dx = p.X - closestX;
            float dy = p.Y - closestY;

            return dx * dx + dy * dy <= d * d;
        }

        var segments = State.FingerPaint;
        var cutoff = LightCoords.Width / 2;

        Func<float, bool> compare = Line == 0 ? (v) => v < cutoff : (v) => v > cutoff;
        segments = segments
            .Where(i => compare(i.A.X) || compare(i.B.X))
                .OrderBy(i => 1 - i.Life)
                .ToList();

        const float distance = 2.5f;
        var index = 0;
        foreach (var p in Pixels)
        {
            var coord = Coords[index++];
            p.Color = Color.Black;
            foreach (var s in segments)
            {
                float d = s.Life * distance;
                d = d * d;
                if (Near(coord, s.A, s.B, d))
                {
                    p.Color = ColorRGB.FromHSL(s.Hue, 1, 0.5);
                    continue;
                }
            }
        }
    }

    static readonly Color[] testColors = [Color.Red, Color.Green, Color.Blue, Color.Yellow, Color.Fuchsia, Color.Teal];

    public void Test()
    {
        if (State.Line != Line)
            return;
        var index = 0;
        int section;
        foreach (var p in Pixels)
        {
            section = Strip.LightToSection(index);
            if (section < 0)
            {
                p.Color = Color.Black;
                index++;
                continue;
            }
            p.Color = testColors[section % testColors.Length];
            if (section != State.Section)
            {
                if (Seconds % 0.5d < 0.25d)
                    p.Color = Color.Black;
            }
            index++;
        }
    }

    public void Pattern()
    {
        var index = 0;
        foreach (var p in Pixels)
        {
            var i = (int)((index + Seconds * 50) / 20);
            switch (i % 4)
            {
                case 0:
                    p.Color = Color.Red;
                    break;
                case 1:
                    p.Color = Color.Green;
                    break;
                case 2:
                    p.Color = Color.Blue;
                    break;
                case 3:
                    p.Color = Color.White;
                    break;
            }
            index++;
        }
    }

    public void AmericasBest()
    {
        var index = 0;
        foreach (var p in Pixels)
        {
            var i = (int)Mod((index + Seconds * 50) / 20, 3);
            switch (i)
            {
                case 0:
                    p.Color = Color.Red;
                    break;
                case 1:
                    p.Color = Color.White;
                    break;
                case 2:
                    p.Color = Color.Blue;
                    break;
            }
            index++;
        }
    }

    public void ConfettiStorm()
    {
        const double rate = 0.004d;
        const double fade = 1.5d;
        var index = 0;
        foreach (var p in Pixels)
        {
            if (p.Color == Color.Black)
            {
                if (Next < rate)
                {
                    var n = Next;
                    if (n < 0.25)
                        p.Color = Color.Yellow;
                    else if (n < 0.5)
                        p.Color = Color.Navy;
                    else if (n < 0.75)
                        p.Color = Color.DarkOrange;
                    else
                        p.Color = Color.Teal;
                    p.Secondary = p.Color;
                    p.Stamp = 0;
                }
            }
            else
            {
                Color c = p.Color;
                p.Stamp += Math.Abs(Delta);
                if (p.Stamp > fade)
                {
                    p.Color = Color.Black;
                    p.Secondary = Color.Black;
                }
                else
                    p.Color = Fade(p.Secondary, (fade - p.Stamp) / fade);
            }
            index++;
        }
    }

    readonly List<NeoPixel> fires = [];

    public void Firecracker()
    {
        if (Changed)
            fires.Clear();
        var d = Math.Abs(Delta);
        foreach (var p in fires)
            p.Stamp -= d;
        fires.RemoveAll(p => p.Stamp <= 0);
        var index = 0;
        foreach (var p in Pixels)
        {
            p.Color = Color.Black;
            p.Data = index++;
            if (Next < 0.01 * d)
            {
                p.Stamp = 1 + Next;
                if (!fires.Contains(p))
                    fires.Add(p);
            }
        }
        foreach (var p in fires)
        {
            p.Color = Color.Yellow;
            for (var i = 1; i < 10; i++)
            {
                var c = Mix(Color.Yellow, Color.Red, i / 10d);
                c = Mix(c, Color.Black, (2 - p.Stamp) / 1.75);
                Near(p.Data + i, c);
                Near(p.Data - i, c);
                if (Next < i / 10d)
                    Near(p.Data + i, Color.Black, false);
                if (Next < i / 10d)
                    Near(p.Data - i, Color.Black, false);
            }
        }
    }

    public void IslandHop()
    {
        var first = Pixels[0];
        first.Stamp -= Math.Abs(Delta);
        if (first.Stamp < 0)
        {
            var c = Next;
            if (c < 0.25)
                first.Secondary = Color.Teal;
            else if (c < 0.5)
                first.Secondary = Color.Aqua;
            else if (c < 0.75)
                first.Secondary = Color.Navy;
            else
                first.Secondary = Color.DarkSeaGreen;
            first.Stamp = 1;
            first.Data = (int)(Next * Strip.SectionCount);
            foreach (var p in Pixels)
                p.Secondary = first.Secondary;
        }
        var range = Strip.SectionToRange(first.Data);
        var index = 0;
        foreach (var p in Pixels)
        {
            if (index >= range.low && index <= range.high)
                p.Color = p.Secondary;
            else
                p.Color = Color.Black;
            if (p != first && Next < 0.1)
                p.Secondary = Color.Black;
            index++;
        }
    }

    public void LavaLamp()
    {
        const double rate = 12;
        const double split = rate / 4;
        Color[] colors = [Color.Red, Color.Orange, Color.Purple, Color.BlueViolet];
        var time = Mod(Seconds, rate);
        int mode;
        if (time < split)
            mode = 0;
        else if (time < split * 2)
            mode = 1;
        else if (time < split * 3)
            mode = 2;
        else
            mode = 3;
        time = 1 - (time - split * mode) / split;
        time = time * time * time;
        foreach (var p in Pixels)
            p.Color = Fade(colors[mode], time);
    }

    struct Bike
    {
        public int Start;
        public int Speed;
        public Color Color;
    }

    static Bike[] bikes = [
        new Bike
        {
            Start = 100,
            Speed = 50,
            Color = Color.Red
        },
        new Bike
        {
            Start = 200,
            Speed = -80,
            Color = Color.Lime
        },
        new Bike
        {
            Start = 1200,
            Speed = 60,
            Color = Color.Yellow
        },
        new Bike
        {
            Start = 700,
            Speed = -45,
            Color = Color.Fuchsia
        },
        new Bike
        {
            Start = 350,
            Speed = 55,
            Color = Color.Teal
        }
    ];

    public void LightcycleRace()
    {
        const int range = 2000;
        const int tail = 100;
        foreach (var p in Pixels)
            p.Color = Color.Black;
        foreach (var b in bikes)
        {
            var p = (int)Mod(b.Start + Seconds * b.Speed, range);
            var c = b.Color;
            for (var i = p; i > p - tail; i--)
            {
                if (i < 0)
                    break;
                var mix = Math.Clamp((p - i) / (double)tail, 0, 1);
                if (b.Speed > 0)
                    mix = 1 - mix;
                c = b.Color;
                c = Mix(Color.White, c, mix * mix);
                var r = i - tail;
                if (r > -1 && r < Pixels.Count)
                    Pixels[r].Add(Fade(c, mix));
            }
        }
    }

    public void MeteorShower()
    {
        const double scale = 10d;
        var index = 0;
        var s = Math.Abs(Seconds * 20);
        foreach (var p in Pixels)
        {
            var b = Math.Sin(index / scale + Seconds * 4);
            b = (b + 1) / 2;
            p.Color = Mix(Color.Blue, Color.Orchid, b);
            if ((index + s) % 18 < 12)
                p.Color = Color.Black;
            index++;
        }
    }

    public void NightSpotlight()
    {
        const float radius = 5f;
        const float radiusSqr = 25f;

        var m = (Math.Sin(Seconds / 2) + 1) / 2;
        var color = Mix(Color.Lime, Color.Blue, m);

        m = Mod(Seconds / 3.14, 2);
        if (m > 1)
            m = 2 - m;
        m = m * (LightCoords.Width - radius * 2) + radius;
        var x = (float)m;

        m = Mod((Seconds + 4) / 1.17, 2);
        if (m > 1)
            m = 2 - m;
        m = m * (LightCoords.Height - radius * 2) + radius;
        var y = (float)m;

        var index = 0;
        foreach (var p in Pixels)
        {
            p.Color = Color.Black;
            if (Coords[index++].DistanceSqr(x, y) < radiusSqr)
                p.Color = color;
        }
    }

    public void OceanWave()
    {
        const float w = 4;
        const float ws = 16;
        var time = Seconds / 2;

        var m = (Math.Sin(time) + 1) / 2;
        var color = Mix(Mix(Color.White, Color.Blue, 0.25), Color.Blue, m);

        var s = (float)(time);
        var h = LightCoords.Height - w * 2;
        var index = 0;
        foreach (var p in Pixels)
        {
            p.Color = Fade(Color.DarkBlue, 0.2);
            var c = Coords[index++];
            var y = (MathF.Sin(s + c.X / 20) + 1) / 2;
            y = h * y + LightCoords.Height / 2;
            float d = c.DistanceSqr(c.X, y);
            if (d < ws)
                p.Color = color;
            else
            {
                d = Math.Max(d - ws, 36) / 36f;
                p.Color = Mix(color, p.Color, d);
            }
        }
    }

    public void Spectrum()
    {
        var index = 0;
        foreach (var p in Pixels)
        {
            var hue = Coords[index].X / LightCoords.Width * 4 + Seconds / 5;
            hue = Mod(hue, 1);
            p.Color = ColorRGB.FromHSL(Mod(hue, 1), 1, 0.5);
            index++;
        }

    }

    public void RainbowChase()
    {
        var index = 0;
        foreach (var p in Pixels)
        {
            p.Color = ColorRGB.FromHSL(Mod(index / 150d + Seconds / 2, 1), 1, 0.5);
            index++;
        }
    }

    readonly List<NeoPixel> blobs = [];

    public void Slime()
    {
        if (Changed)
            blobs.Clear();
        var d = Math.Abs(Delta);
        foreach (var p in blobs)
            p.Stamp -= d;
        blobs.RemoveAll(p => p.Stamp <= 0);
        var index = 0;
        foreach (var p in Pixels)
        {
            p.Color = Color.Black;
            p.Data = index++;
            if (Next < 0.002 * d)
            {
                p.Stamp = 10;
                if (!blobs.Contains(p))
                    blobs.Add(p);

            }
        }
        foreach (var p in blobs)
        {
            d = 1 - Math.Abs(5 - p.Stamp) / 5;
            var c = Mix(Color.Black, Color.Lime, d);
            p.Color = c;
            for (var i = 1; i < 50; i++)
            {
                var f = i / 50d;
                f = (1 - f * f) * d;
                var m = Mix(Color.Black, c, f);
                Near(p.Data + i, m);
                Near(p.Data - i, m);
            }
        }
    }

    static int IsNearLine(PointF center, float angle, PointF p, float distance)
    {
        float dx = MathF.Cos(angle);
        float dy = MathF.Sin(angle);
        float px = p.X - center.X;
        float py = p.Y - center.Y;
        float perpDistance = px * dy - py * dx;
        if (MathF.Abs(perpDistance) > distance)
            return 0;
        float projection = px * dx + py * dy;
        if (projection > 0)
            return 1;
        else if (projection < 0)
            return -1;
        else
            return 1;
    }


    public void SpinTheBottle()
    {

        var origin = new PointF(LightCoords.Width / 2f, LightCoords.Height / 2f);
        var angle = (float)(Mod(Seconds, 4) / 4 * Math.PI * 2);
        int index = 0;
        foreach (var p in Pixels)
        {
            p.Color = Color.Black;
            var i = IsNearLine(origin, angle, Coords[index], 4);
            if (i == 1)
                p.Color = Color.Fuchsia;
            else if (i == -1)
                p.Color = Color.Blue;
            index++;
        }
    }

    public void WheelOfFortune()
    {
        Color[] colors = [Color.Red, Color.Indigo, Color.Violet, Color.Aqua, Color.Orange,
            Color.BurlyWood, Color.Green, Color.Brown, Color.Gold, Color.Teal];
        var index = 0;
        var origin = new PointF(LightCoords.Width / 2f, LightCoords.Height / 2f);
        foreach (var p in Pixels)
        {
            var point = Coords[index].Subtract(origin);
            var radians = (Math.Atan2(point.X, point.Y) + Math.PI) / Math.PI + Math.Sin(Seconds / 10) * 4;
            radians = Mod(radians, 1) * colors.Length;
            var i = (int)radians;
            p.Color = colors[i];
            index++;
        }
    }

    public void Wipeout()
    {
        var hue = Mod(Seconds / 3.14, 1);
        var color = (Color)ColorRGB.FromHSL(hue, 1, 0.5);
        var s = Mod(Seconds, 16);
        if (s > 8)
            s = 16 - s;
        s /= 8;
        const double margin = 6;
        const double bar = 4;
        s = s * (LightCoords.Width + margin) - margin / 2;
        int index = 0;
        foreach (var p in Pixels)
        {
            p.Color = Color.Black;
            var x = Coords[index].X;
            if (x > s - bar && x < s + bar)
                p.Color = color;
            index++;
        }
    }
}