using System.Drawing;
using System.Collections;

namespace Lights;

public class LightCoords : IEnumerable<PointF>
{
    private static readonly LightCoords a;
    private static readonly LightCoords b;
    public static LightCoords A { get => a; }
    public static LightCoords B { get => b; }
    public const float Width = 185.5f;
    public const float Height = 23.5f;

    static LightCoords()
    {
        var s = App.AppPath("private");

        void add(List<PointF> list, string search)
        {
            foreach (var f in Directory.GetFiles(s, search).OrderBy(n => n))
            {
                var lines = File.ReadAllLines(f);
                foreach (var line in lines)
                {
                    var coord = line.Trim();
                    if (string.IsNullOrEmpty(coord))
                        continue;
                    var values = coord.Split(',')
                        .Select(s => s.Trim())
                        .Where(s => float.TryParse(s, out _))
                        .Select(float.Parse)
                        .ToArray();
                    if (values.Length == 2)
                        list.Add(new PointF(values[0], values[1]));
                }
            }
        }

        a = new();
        add(a.lights, "a*.txt");
        b = new();
        add(b.lights, "b*.txt");
    }

    private readonly List<PointF> lights = [];

    public PointF this[int index]
    {
        get => lights[index];
    }

    public int Count
    {
        get => lights.Count;
    }

    public IEnumerator<PointF> GetEnumerator() => lights.GetEnumerator();
    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}