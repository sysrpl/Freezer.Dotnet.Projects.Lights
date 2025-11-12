namespace Lights;

public partial class HomePage : PageHandler
{
    [Action("paint-add-line")]
    public void PaintAddLine()
    {
        SleepMonitor.Touch();
        AudioEngine.Paint();
        var ax = ReadFloat("ax");
        var ay = ReadFloat("ay");
        var bx = ReadFloat("bx");
        var by = ReadFloat("by");
        var h = ReadFloat("hue");
        state.AddFingerPaint(ax, ay, bx, by, h);
    }
}