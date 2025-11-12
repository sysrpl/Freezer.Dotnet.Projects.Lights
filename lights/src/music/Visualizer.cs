namespace Lights;

public struct Column
{
    public float X;
    public float Width;
}

public class Visualizer
{
    public float[] Volume;
    public float[,] Wave;
    public float[] Graph;

    public Column Column(int n, float space = 4)
    {
        float columns = Graph.Length;
        float w = (LightCoords.Width - space * (columns + 1)) / columns;
        Column column = new()
        {
            Width = w,
            X = space + n * (w + space)
        };
        return column;
    }
}