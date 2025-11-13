#if nocache
using Microsoft.AspNetCore.StaticFiles;
#endif

using Microsoft.AspNetCore.Http;

namespace Lights;

public static class Program
{
#if nocache
    static void BeginRequest(ContextEventArgs args)
    {
        var r = args.Context.Response;
        r.Headers.CacheControl = "no-cache, no-store, must-revalidate";
        r.Headers.Pragma = "no-cache";
        r.Headers.Expires = "0";
    }

    static void StaticPrepareResponse(StaticFileResponseContext args)
    {
        var r = args.Context.Response;
        r.Headers.CacheControl = "no-cache, no-store, must-revalidate";
        r.Headers.Pragma = "no-cache";
        r.Headers.Expires = "0";
    }
#endif

    static readonly object mutex = new();
    static bool allowPublic = false;
    static long wanExpire = 0;
    static string wanAddress = "";

    const string AccessKey = "accesskey";

    static void WriteCookie(HttpContext context, string key, string value)
    {
        var options = new CookieOptions
        {
            Expires = DateTimeOffset.Now.AddDays(1),
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict
        };
        context.Response.Cookies.Append(key, value, options);
    }

    static string ReadCookie(HttpContext context, string key)
    {
        if (context.Request.Cookies.TryGetValue(key, out string value))
            return value;
        return null;
    }

    static long GetDays()
    {
        var year2000 = new DateTime(2000, 1, 1);
        var today = DateTime.Now.Date;
        return (today - year2000).Days;
    }

    public static string GetDailyCode()
    {
        DateTime today = DateTime.Now;
        // Day of month (01-31)
        int day = today.Day;
        // Month (01-12)
        int month = today.Month;
        // Last 2 digits of year
        int year = today.Year % 100;
        // Part 1: Day reversed (12 becomes 21)
        int part1 = (day % 10) * 10 + (day / 10);
        // Part 2: Month + Day (simple sum, mod 100 to keep 2 digits)
        int part2 = (month + day) % 100;
        // Part 3: Year digits swapped (25 becomes 52)
        int part3 = (year % 10) * 10 + (year / 10);
        return $"{part1:D2}{part2:D2}{part3:D2}";
    }

    static void HandleBeginRequest(ContextEventArgs args)
    {
        var address = args.Context.Connection.RemoteIpAddress?.ToString();
        if (string.IsNullOrWhiteSpace(address))
        {
            args.Handled = true;
            return;
        }
        var local = address.StartsWith("192.168.") || address.StartsWith("127.0.0.") ||
            allowPublic || !Device.IsPi;
        if (!local)
            lock (mutex)
            {
                var d = GetDays();
                if (d > wanExpire)
                {
                    wanExpire = d;
                    using var client = new HttpClient();
                    wanAddress = client.GetStringAsync("https://checkip.amazonaws.com").Result.Trim();
                }
                local = address == wanAddress;
            }
        local = local || ReadCookie(args.Context, AccessKey) == GetDailyCode();
        if (!local)
        {
            var code = GetDailyCode();
            var query = args.Context.Request.QueryString.Value;
            if (string.IsNullOrWhiteSpace(query))
                query = "";
            const string key = "login=";
            int index = query.IndexOf(key);
            if (index == -1)
                query = "";
            else
                query = query.Substring(index + key.Length);
            if (query == code)
            {
                WriteCookie(args.Context, AccessKey, code);
                local = true;
            }
        }
        if (!local)
        {
            args.Context.Response.Redirect("/login.htm");
            args.Handled = true;
            return;
        }
        if (address.Contains("action=") && address.Contains("-set-"))
            SleepMonitor.Touch();
    }

    public static ServiceEvent Events { get; private set; }

    public static void Main(string[] args)
    {
        // This setting enforces external daily code authentication
        allowPublic = true;
        var fake = !Device.IsPi;
        Task.Run(() => PixelBase.Run(0, fake));
        Task.Run(() => PixelBase.Run(1, fake));
#if nocache
        App.OnBeginRequest += BeginRequest;
        App.OnStaticPrepareResponse += StaticPrepareResponse;
#endif
        App.Domain = "shawshack.club";
        App.CaptivePortal = !fake;
        Events = App.RegisterEvent("/events");
        //App.RegisterEvent("/music");
        //App.RegisterEvent("/movies");
        App.OnBeginRequest += HandleBeginRequest;
        App.Run(args);
        LightState.Current.Running = false;
    }
}
