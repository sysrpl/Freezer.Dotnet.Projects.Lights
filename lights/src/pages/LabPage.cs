namespace Lights;

public partial class HomePage : PageHandler
{
    [Action("lab-set-intensity")]
    public void LabSetIntesity() => state.Intensity = ReadFloat("intensity");

    [Action("lab-get-intensity")]
    public void LabGetIntesity() => Write($"[{state.Intensity}]");

    [Action("lab-get-data")]
    public void LabGetData()
    {
        switch (ReadInt("line"))
        {
            case 0:
                Write($"[{state.D0}]");
                break;
            case 1:
                Write($"[{state.D1}]");
                break;
        }
    }

    [Action("lab-set-line")]
    public void LabSetLine() => state.Line = ReadInt("line");

    [Action("lab-set-section")]
    public void LabSetSection() => state.Section = ReadInt("section");

    [Action("lab-set-count")]
    public void LabSetCount()
    {
        var line = ReadInt("line");
        var section = ReadInt("section");
        var count = ReadInt("count");
        lock (LightState.Mutex)
        {
            if (line == 0)
                state.D0.UpdateSection(section, count);
            else if (line == 1)
                state.D1.UpdateSection(section, count);
            state.Line = line;
            state.Off = false;
            state.Effect = "test";
            state.Save(line);
        }
    }

    [Action("lab-pattern")]
    public void LabPattern()
    {
        lock (LightState.Mutex)
        {
            state.Off = false;
            state.Effect = "pattern";
        }
    }

    [Action("lab-off")]
    public void LabOff()
    {
        lock (LightState.Mutex)
        {
            if (state.Line == 0)
                state.D0.Compact();
            else if (state.Line == 1)
                state.D1.Compact();
            state.Off = true;
            state.Effect = "none";
            state.Save(state.Line);
        }
    }
}