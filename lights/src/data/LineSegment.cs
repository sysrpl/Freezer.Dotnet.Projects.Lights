using System.Drawing;

namespace Lights;

public class LineSegment
{
    public PointF A { get; set; }
    public PointF B { get; set; }
    public float Hue { get; set; }
    public double Stamp { get; set; }
    public float Life { get; set; }
}