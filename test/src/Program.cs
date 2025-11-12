#define hardware
// #define strip

namespace Lights.Test;

public static class Program
{
    static void CheckPageType(ContextEventArgs args)
    {
        var s = App.MapPath(args.Context);
        if (Directory.Exists(s))
        {
#if hardware
            args.Handler = new HardwarePage();
#endif
#if strip
            args.Handler = new StripPage();
#endif
        }
    }

    public static void Main(string[] args)
    {
        App.OnProcessRequest += CheckPageType;
#if strip
        if (Device.IsPi)
        {
            Task.Run(StripPage.LightThread);
            App.CaptivePortal = true;
        }
#endif
        App.Run(args);
    }
}
