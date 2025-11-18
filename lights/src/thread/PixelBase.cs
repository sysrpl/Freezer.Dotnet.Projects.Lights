using System.Diagnostics;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Text;

namespace Lights;

public class PixelBase
{
    Random random;
    public int Line { get; private set; }
    public LightState State { get; private set; }
    public LightStrip Strip { get; private set; }
    public NeoPixelStrip Pixels { get; private set; }
    public double Seconds { get; private set; }
    public double Delta { get; private set; }
    public string Effect { get; private set; }
    public bool Changed { get; private set; }
    protected LightCoords Coords { get; private set; }

    public double Next { get => random.NextDouble(); }

    public static double Mod(double a, double b) => ((a % b) + b) % b;
    public static float ModF(float a, float b) => ((a % b) + b) % b;

    public void Intensity(NeoPixel pixel)
    {
        if (Device.IsPi)
            if (pixel.Color != Color.Black)
            {
                var i = State.Intensity;
                if (i < 0.5f)
                {
                    i /= 0.5f;
                    i = i * i * i;
                    i /= 2f;
                }
                pixel.Intensity(i);
            }
    }

    public Color Fade(Color color, double percent)
    {
        percent = Math.Clamp(percent, 0, 1);
        if (percent < 0.001)
            return Color.Black;
        if (percent > 0.999)
            return color;
        double r = color.R * percent;
        double g = color.G * percent;
        double b = color.B * percent;
        return Color.FromArgb((byte)r, (byte)g, (byte)b);
    }

    public Color Mix(Color a, Color b, double percent)
    {
        if (percent <= 0)
            return a;
        if (percent >= 1)
            return b;
        var i = 1 - percent;
        int red = (int)(a.R * i + b.R * percent);
        int blue = (int)(a.B * i + b.B * percent);
        int green = (int)(a.G * i + b.G * percent);
        return Color.FromArgb(red, green, blue);
    }

    public void Near(int index, Color color, bool add = true)
    {
        if (index < 0 || index > Pixels.Count - 1)
            return;
        if (add)
            Pixels[index].Add(color);
        else
            Pixels[index] = color;
    }

    void Blink()
    {
        Color[] colors = [Color.Red, Color.Green, Color.Blue];
        Pixels.Reset();
        var s = Stopwatch.StartNew();
        long i = 0;
        long index = 0;
        while (true)
        {
            i++;
            var j = 0;
            foreach (var p in Pixels)
            {
                if ((j + i) % 10 == 0)
                    p.Color = colors[index++ % 3];
                else
                    p.Color = Color.Black;
                Intensity(p);
                j++;
            }
            Pixels.Update();
            if (s.Elapsed.TotalSeconds > 5)
                break;
        }
    }

    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    struct Header
    {
        public int size;
        public byte d0;
        public byte d1;
        public byte d2;
        public byte d3;
        public int count;
    }

    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    struct PixelData
    {
        public int index;
        public byte a;
        public byte r;
        public byte g;
        public byte b;
    }

    readonly int count;
    readonly int offset;
    Header header;
    MemoryStream stream = null;
    BinaryWriter writer = null;
    PixelData[] data;

    void SendPixels()
    {
        if (stream == null)
        {
            stream = new MemoryStream();
            writer = new BinaryWriter(stream);
            data = new PixelData[count];
        }

        var index = 0;
        foreach (var p in Pixels)
        {
            data[index].index = index + offset;
            data[index].a = 0xFF;
            data[index].r = p.Color.R;
            data[index].g = p.Color.G;
            data[index].b = p.Color.B;
            index++;
        }
        stream.Position = 0;
        stream.SetLength(0);
        writer.Write(header.size);
        writer.Write(header.d0);
        writer.Write(header.d1);
        writer.Write(header.d2);
        writer.Write(header.d3);
        writer.Write(header.count);
        for (int i = 0; i < count; i++)
        {
            writer.Write(data[i].index);
            writer.Write(data[i].a);
            writer.Write(data[i].r);
            writer.Write(data[i].g);
            writer.Write(data[i].b);
        }
        writer.Flush();
        TestSocket.Send(stream.ToArray());
    }

    void PixelsUpdate(object sender, EventArgs e)
    {
        if (TestSocket.Connected)
            SendPixels();
    }

    public PixelBase(int dataLine, bool fake)
    {
        count = (dataLine == 0) ? LightState.Current.D0.LightCount : LightState.Current.D1.LightCount;
        offset = 0;
        if (dataLine == 1)
            offset = LightState.Current.D0.LightCount;
        header.size = Marshal.SizeOf<Header>() + Marshal.SizeOf<PixelData>() * count;
        header.d0 = (byte)'D';
        header.d1 = (byte)'A';
        header.d2 = (byte)'T';
        header.d3 = (byte)'A';
        header.count = count;
        random = new();
        Effect = "";
        Line = dataLine;
        Changed = true;
        Pixels = new NeoPixelStrip(count, dataLine, fake);
        State = new LightState();
        Strip = (dataLine == 0) ? State.D0 : State.D1;
        Coords = (dataLine == 0) ? LightCoords.A : LightCoords.B;
        Pixels.OnBeforeUpdate += PixelsUpdate;
    }

    public static void Run(int dataLine, bool fake)
    {
        var obj = new PixelEffects(dataLine, fake);

        Action effect;
        var last = "";
        var metrics = new Stopwatch();
        var timer = new Stopwatch();
        timer.Start();
        var seconds = 50 + obj.Next * 100;
        var delta = 0d;
        var priorTime = 0d;
        var currentTime = 0d;
        obj.Blink();
        metrics.Start();

        while (obj.State.Running)
        {
            if (dataLine == 0)
                LightState.Current.Time0 = metrics.Elapsed.TotalMilliseconds;
            else
                LightState.Current.Time1 = metrics.Elapsed.TotalMilliseconds;
            metrics.Restart();
            obj.State.Assign(LightState.Current);
            obj.Changed = false;

            currentTime = timer.Elapsed.TotalSeconds;
            delta = (currentTime - priorTime) * obj.State.Speed;
            seconds += delta;
            obj.Delta = delta;
            priorTime = currentTime;
            if (dataLine == 0)
                LightState.Current.Sync = seconds;
            else
                seconds = LightState.Current.Sync;
            obj.Seconds = seconds;
            if (AudioEngine.TryLock(obj.DrawVisuals))
            {
                foreach (var p in obj.Pixels)
                    obj.Intensity(p);
                obj.Pixels.Update();
                obj.Pixels.Reset();
                continue;
            }
            if (obj.State.Off)
            {
                obj.Pixels.Reset();
                obj.Pixels.Update();
                continue;
            }
            effect = null;
            if (last != obj.State.Effect)
            {
                last = obj.State.Effect;
                obj.Changed = true;
            }
            if (obj.State.Intensity == 0f)
            {
                obj.Pixels.Reset();
                obj.Pixels.Update();
                continue;
            }
            switch (obj.State.Effect)
            {
                case "solid":
                    effect = obj.Solid;
                    break;
                case "fingerpaint":
                    effect = obj.FingerPaint;
                    break;
                case "test":
                    effect = obj.Test;
                    break;
                case "pattern":
                    effect = obj.Pattern;
                    break;
                case "randomcolors":
                    effect = obj.RandomColors;
                    break;
                case "americasbest":
                    effect = obj.AmericasBest;
                    break;
                case "confettistorm":
                    effect = obj.ConfettiStorm;
                    break;
                case "firecracker":
                    effect = obj.Firecracker;
                    break;
                case "islandhop":
                    effect = obj.IslandHop;
                    break;
                case "meteorshower":
                    effect = obj.MeteorShower;
                    break;
                case "lavalamp":
                    effect = obj.LavaLamp;
                    break;
                case "lightcyclerace":
                    effect = obj.LightcycleRace;
                    break;
                case "nightspotlight":
                    effect = obj.NightSpotlight;
                    break;
                case "oceanwave":
                    effect = obj.OceanWave;
                    break;
                case "spectrum":
                    effect = obj.Spectrum;
                    break;
                case "rainbowchase":
                    effect = obj.RainbowChase;
                    break;
                case "slime":
                    effect = obj.Slime;
                    break;
                case "spinthebottle":
                    effect = obj.SpinTheBottle;
                    break;
                case "wheeloffortune":
                    effect = obj.WheelOfFortune;
                    break;
                case "wipeout":
                    effect = obj.Wipeout;
                    break;
                default:
                    effect = null;
                    break;
            }
            if (effect != null)
            {
                effect();
                foreach (var p in obj.Pixels)
                    obj.Intensity(p);
            }
            else
                obj.Pixels.Reset();
            obj.Pixels.Update();
        }
    }
}
