using System.Runtime.InteropServices;

static class Mpg123
{
    public const int MPG123_OK = 0;
    public const int MPG123_DONE = -12;

    [DllImport("mpg123")]
    public static extern int mpg123_init();

    [DllImport("mpg123")]
    public static extern IntPtr mpg123_new(string decoder, out int error);

    [DllImport("mpg123")]
    public static extern void mpg123_delete(IntPtr handle);

    [DllImport("mpg123")]
    public static extern void mpg123_exit();

    [DllImport("mpg123")]
    public static extern int mpg123_open(IntPtr handle, string path);

    [DllImport("mpg123")]
    public static extern int mpg123_close(IntPtr handle);

    [DllImport("mpg123")]
    public static extern int mpg123_read(IntPtr handle, byte[] buffer, int bufferSize, out int done);

    [DllImport("mpg123")]
    public static extern int mpg123_format_none(IntPtr handle);

    [DllImport("mpg123")]
    public static extern int mpg123_format(IntPtr handle, int rate, int channels, int enc);

    [DllImport("mpg123")]
    public static extern int mpg123_getformat(IntPtr handle, out int rate, out int channels, out int enc);

    public const int MPG123_ENC_SIGNED_16 = 0x040;
}
