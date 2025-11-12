namespace Lights;

public static class FastFourier
{
    /// <summary>
    /// Computes the Fast Fourier Transform (FFT) of a complex array.
    /// The input array is modified in place, and the output is stored in the same array.
    /// </summary>
    /// <param name="buffer">A power of two length array of complex numbers</param>
    /// <param name="forward"></param>
    public static void Compute(Complex[] buffer, bool forward = true)
    {
        int n = buffer.Length;
        int bits = (int)MathF.Log2(n);

        for (int i = 0; i < n; i++)
        {
            int j = BitReverse(i, bits);
            if (j > i)
            {
                var temp = buffer[i];
                buffer[i] = buffer[j];
                buffer[j] = temp;
            }
        }

        for (int len = 2; len <= n; len <<= 1)
        {
            float angle = (forward ? -2f : 2f) * MathF.PI / len;
            var w = new Complex(MathF.Cos(angle), MathF.Sin(angle));

            for (int i = 0; i < n; i += len)
            {
                var c = new Complex(1);
                for (int j = 0; j < len / 2; j++)
                {
                    var u = buffer[i + j];
                    var v = buffer[i + j + len / 2] * c;
                    buffer[i + j] = u + v;
                    buffer[i + j + len / 2] = u - v;
                    c *= w;
                }
            }
        }

        if (!forward)
        {
            float scale = 1f / n;
            for (int i = 0; i < n; i++)
            {
                buffer[i].X *= scale;
                buffer[i].Y *= scale;
            }
        }
    }

    private static int BitReverse(int x, int bits)
    {
        int y = 0;
        for (int i = 0; i < bits; i++)
        {
            y = (y << 1) | (x & 1);
            x >>= 1;
        }
        return y;
    }
}
