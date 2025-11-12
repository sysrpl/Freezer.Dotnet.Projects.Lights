using System.Text.Json;

namespace Lights;

public partial class HomePage : PageHandler
{
    public struct Settings
    {
        public float intensity { get; set; }
        public float speed { get; set; }
        public float volume { get; set; }
        public int visuals { get; set; }
        public int visualsource { get; set; }
        public int sleep { get; set; }
    }

    [Action("settings-get-all")]
    public void SettingsGetAll()
    {
        var s = new Settings();
        s.intensity = state.Intensity / LightState.lightmax * 5f;
        s.speed = state.Speed;
        s.volume = state.MasterVolume;
        s.visuals = (int)state.Visuals;
        s.visualsource = (int)state.VisualSource;
        s.sleep = (int)SleepMonitor.Mode;
        Write(JsonSerializer.Serialize(s));
    }

    [Action("settings-get-access-code")]
    public void SettingsGetAccessCode() => Write($"[\"{Program.GetDailyCode()}\"]");

    [Action("settings-load")]
    public void SettingsLoad() => state.Load();

    [Action("settings-save")]
    public void SettingsSave() => state.Save();

    [Action("settings-get-volume")]
    public void SettingsGetVolume() => Write($"[ {state.MasterVolume} ]");

    [Action("settings-set-volume")]
    public void SettingsSetVolume()
    {
        state.MasterVolume = ReadFloat("volume");
        state.SaveVolume();
    }

    [Action("settings-get-intensity")]
    public void SettingsGetIntensity() => Write($"[{state.Intensity / LightState.lightmax * 5f}]");

    [Action("settings-set-intensity")]
    public void SettingsSetIntensity() => state.Intensity = ReadFloat("intensity") / 5f * LightState.lightmax;

    [Action("settings-get-speed")]
    public void SettingsGetSpeed() => Write($"[{state.Speed}]");

    [Action("settings-set-speed")]
    public void SettingsSetSpeed() => state.Speed = ReadFloat("speed");

    [Action("settings-get-visuals")]
    public void SettingsGetVisuals() => Write($"[{(int)state.Visuals}]");

    [Action("settings-set-visuals")]
    public void SettingsSetVisuals()
    {
        var v = ReadInt("visuals");
        if (Enum.IsDefined(typeof(AudioVisuals), v))
            state.Visuals = (AudioVisuals)v;
    }

    [Action("settings-get-visual-source")]
    public void SettingsGetVisualSource() => Write($"[{(int)state.VisualSource}]");

    [Action("settings-set-visual-source")]
    public void SettingSetVisualSource()
    {
        var v = ReadInt("source");
        if (Enum.IsDefined(typeof(AudioVisualSource), v))
            state.VisualSource = (AudioVisualSource)v;
    }

    [Action("settings-get-sleep")]
    public void SettingsGetSleep() => Write($"[{(int)SleepMonitor.Mode}]");

    [Action("settings-set-sleep")]
    public void SettingsSetSleep()
    {
        var v = ReadInt("sleep");
        if (Enum.IsDefined(typeof(SleepMode), v))
            SleepMonitor.Mode = (SleepMode)v;
    }

    [Action("settings-get-sysinfo")]
    public void SettingsGetSysInfo()
    {
        var m = SystemInformation.GetMetrics();
        var s = JsonSerializer.Serialize(m);
        Write(s);
    }
}