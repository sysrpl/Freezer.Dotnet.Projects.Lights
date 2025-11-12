using System.Drawing;

namespace Lights;

public static class ToolExtensions
{
    public static PointF Add(this PointF a, PointF b)
        => new(a.X + b.X, a.Y + b.Y);

    public static PointF Subtract(this PointF a, PointF b)
        => new(a.X - b.X, a.Y - b.Y);

    public static float Distance(this PointF p, float x, float y)
    {
        x -= p.X;
        y -= p.Y;
        return MathF.Sqrt(x * x + y * y);
    }

    public static float Distance(this PointF a, PointF b)
    {
        return a.Distance(b.X, b.Y);
    }

    public static float DistanceSqr(this PointF p, float x, float y)
    {
        x -= p.X;
        y -= p.Y;
        return x * x + y * y;
    }

    public static float DistanceSqr(this PointF a, PointF b)
    {
        return a.DistanceSqr(b.X, b.Y);
    }

    public static bool TryParseColor(this string hex, out Color color)
    {
        color = Color.Empty;
        if (string.IsNullOrWhiteSpace(hex))
            return false;
        hex = hex.TrimStart('#');
        // Support #RGB, #RRGGBB, and #AARRGGBB formats
        if (hex.Length != 3 && hex.Length != 6 && hex.Length != 8)
            return false;
        try
        {
            if (hex.Length == 3)
            {
                // Convert RGB to RRGGBB
                int r = Convert.ToInt32(hex[0].ToString() + hex[0], 16);
                int g = Convert.ToInt32(hex[1].ToString() + hex[1], 16);
                int b = Convert.ToInt32(hex[2].ToString() + hex[2], 16);
                color = Color.FromArgb(r, g, b);
            }
            else if (hex.Length == 6)
            {
                int r = Convert.ToInt32(hex.Substring(0, 2), 16);
                int g = Convert.ToInt32(hex.Substring(2, 2), 16);
                int b = Convert.ToInt32(hex.Substring(4, 2), 16);
                color = Color.FromArgb(r, g, b);
            }
            else
            {
                int a = Convert.ToInt32(hex.Substring(0, 2), 16);
                int r = Convert.ToInt32(hex.Substring(2, 2), 16);
                int g = Convert.ToInt32(hex.Substring(4, 2), 16);
                int b = Convert.ToInt32(hex.Substring(6, 2), 16);
                color = Color.FromArgb(a, r, g, b);
            }
            return true;
        }
        catch
        {
            return false;
        }
    }
}