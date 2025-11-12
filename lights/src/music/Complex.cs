namespace Lights;

public struct Complex(float x, float y = 0)
{
    public float X = x, Y = y;

    public static Complex operator +(Complex a, Complex b) =>
        new(a.X + b.X, a.Y + b.Y);

    public static Complex operator -(Complex a, Complex b) =>
        new(a.X - b.X, a.Y - b.Y);

    public static Complex operator *(Complex a, Complex b) =>
        new(a.X * b.X - a.Y * b.Y, a.X * b.Y + a.Y * b.X);

    /// <summary>
    /// Calculates the magnitude of the complex number in decibels.
    /// </summary>
    /// <param name="spanDb">The span of decibels</param>
    /// <param name="floorDb">The floor decibel</param>
    /// <returns></returns>
    public readonly float Magnitude(float spanDb = 90f, float floorDb = -90f)
    {
        const double fullScale = short.MaxValue;
        double m = Math.Sqrt(X * X + Y * Y);
        if (m < 1e-9) m = 1e-9;
        double db = 20.0 * Math.Log10(m / fullScale);
        if (db <= floorDb) return 0f;
        double norm = (db - floorDb) / spanDb;
        if (norm > 1.0) norm = 1.0f;
        return (float)norm;
    }
}