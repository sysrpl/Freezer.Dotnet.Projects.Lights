namespace Lights;

using static SDL2.SDL;
using static Mpg123;
using System.Runtime.InteropServices;
using System.Diagnostics;

public enum AudioVisuals
{
    None,
    Histogram,
    Levels,
    Cloud,
    Wave
}

public enum AudioVisualSource
{
    Music,
    Microphone
}

public class AudioEngine
{
    static readonly object mutex = new();
    static bool playing = false;
    static bool listening = false;
    static string song = "";
    static Stopwatch playtime = null;
    static Stopwatch paint = null;
    static AudioEngine music = null;
    static Task musicTask = null;
    static AudioEngine mic = null;
    static Task micTask = null;

    Visualizer data;
    readonly string fileName;

    static AudioEngine()
    {
        SDL_Init(SDL_INIT_AUDIO);
        paint = new Stopwatch();
        paint.Start();
    }

    AudioEngine(string fileName = "")
    {
        this.fileName = fileName;
    }

    public static bool Busy
    {
        get
        {
            if (LightState.Current.Visuals == AudioVisuals.None)
                return false;
            lock (mutex)
                return listening || playing;
        }
    }

    public static void Paint()
    {
        paint.Restart();
    }

    public static bool TryLock(Action<Visualizer> action)
    {
        if (paint.Elapsed.TotalSeconds < 6)
            return false;
        if (LightState.Current.Visuals == AudioVisuals.None)
            return false;
        Visualizer v = null;
        lock (mutex)
        {
            if (listening)
                v = mic.data;
            else if (playing)
                v = music.data;
        }
        if (v == null)
            return false;
        lock (v)
            action(v);
        return true;
    }

    public static void OpenMusic(string fileName)
    {
        CloseMusic();
        Sleep(100);
        lock (mutex)
        {
            if (playing)
                return;
            if (!File.Exists(fileName))
                return;
            playing = true;
            song = Path.GetFileNameWithoutExtension(fileName);
            music = new AudioEngine(fileName);
            musicTask = Task.Run(music.MusicTask);
            playtime = Stopwatch.StartNew();
            _ = Program.Events.Broadcast("music", $"'{song}'");
        }
    }

    public static void CloseMusic()
    {
        var wasplaying = false;
        lock (mutex)
        {
            wasplaying = playing;
            playing = false;
        }
        if (wasplaying)
            musicTask.Wait();
        if (wasplaying)
            lock (mutex)
            {
                music = null;
                musicTask = null;
                _ = Program.Events.Broadcast("music", "''");
            }
    }

    public static void OpenMic()
    {
        lock (mutex)
        {
            if (listening)
                return;
            listening = true;
            mic = new AudioEngine();
            micTask = Task.Run(mic.MicTask);
        }
    }

    public static void CloseMic()
    {
        lock (mutex)
        {
            if (!listening)
                return;
            listening = false;
            micTask.Wait();
            micTask = null;
            mic = null;
        }
    }

    public static double Playtime
    {
        get
        {
            lock (mutex)
            {
                if (!playing)
                    return -1;
                return playtime.Elapsed.TotalSeconds;
            }
        }
    }

    public static bool Playing
    {
        get
        {
            lock (mutex)
                return playing;
        }
    }

    public static bool Listening
    {
        get
        {
            lock (mutex)
                return listening;
        }
    }

    public static string Song
    {
        get
        {
            lock (mutex)
                return playing ? song : "";
        }
    }

    static float[] GetBarRange(int n, int count)
    {
        const double lowerCutoff = 40.0;
        const double upperCutoff = 6000.0;
        var logLow = Math.Log10(lowerCutoff);
        var logHigh = Math.Log10(upperCutoff);
        var step = (logHigh - logLow) / count;
        var lower = (float)Math.Pow(10.0, logLow + n * step);
        var upper = (float)Math.Pow(10.0, logLow + (n + 1) * step);
        return [lower, upper];
    }

    void MicTask()
    {
        const int SAMPLE_RATE = 44100;
        const int FFT_SAMPLES = 4096;
        const int AUDIO_SAMPLES = 1024;
        const int AUDIO_MONO = 1;
        const int BIN_COUNT = 30;
        const int ROLL = 3;
        const int DECIBELS = 65;

        data = new()
        {
            Volume = new float[2],
            Wave = new float[2, AUDIO_SAMPLES],
            Graph = new float[BIN_COUNT]
        };

        float[] leftwaveform = new float[AUDIO_SAMPLES];
        float[] rightwaveform = new float[AUDIO_SAMPLES];
        float[] leftroll = new float[ROLL];
        float[] rightroll = new float[ROLL];
        float[] bins = new float[BIN_COUNT];
        float[,] binroll = new float[ROLL, BIN_COUNT];
        int rollindex = 0;

        short[] samples = new short[AUDIO_SAMPLES * AUDIO_MONO];
        byte[] buffer = new byte[AUDIO_SAMPLES * AUDIO_MONO * sizeof(short)];
        SDL_AudioSpec want = new SDL_AudioSpec
        {
            freq = SAMPLE_RATE,
            format = AUDIO_S16LSB,
            channels = AUDIO_MONO,
            samples = AUDIO_SAMPLES,
            callback = null,
            userdata = IntPtr.Zero
        };
        var audio = SDL_OpenAudioDevice(null, 1, ref want, out SDL_AudioSpec obtained, 0);
        if (audio == 0)
        {
            WriteLine("Failed to open audio device: " + SDL_GetError());
            return;
        }
        if (obtained.channels != AUDIO_MONO || obtained.format != AUDIO_S16LSB)
        {
            SDL_CloseAudioDevice(audio);
            WriteLine("Failed to get desired audio format: " + SDL_GetError());
            return;
        }

        SDL_PauseAudioDevice(audio, 0);
        GCHandle pin = GCHandle.Alloc(buffer, GCHandleType.Pinned);
        try
        {
            float secondsPerSample = 1.0f / obtained.freq;
            float totalSamplesPlayed = 0;
            var stopwatch = Stopwatch.StartNew();
            uint done = 0;

            while (listening)
            {
                int samplesThisFrame = (int)done / (sizeof(short) * obtained.channels);
                double timeShouldHaveElapsed = totalSamplesPlayed * secondsPerSample;
                double timeActuallyElapsed = stopwatch.Elapsed.TotalSeconds;
                double sleepTime = timeShouldHaveElapsed - timeActuallyElapsed;
                Sleep(Math.Max(1, (int)(sleepTime * 1000)));
                int available = (int)SDL_GetQueuedAudioSize(audio);
                if (available > buffer.Length - 1)
                {
                    available = buffer.Length;
                    done = SDL_DequeueAudio(audio, pin.AddrOfPinnedObject(), (uint)available);
                    totalSamplesPlayed += samplesThisFrame;
                    Buffer.BlockCopy(buffer, 0, samples, 0, buffer.Length);

                    #region Volume
                    float leftSum = 0f, rightSum = 0f;
                    int leftCount = 0, rightCount = 0;
                    for (int i = 0; i < samples.Length; i++)
                    {
                        float sample = Math.Abs(samples[i] / 24000f);
                        if (sample > 1f) sample = 1f;
                        leftwaveform[i] = samples[i];
                        leftSum += sample * sample;
                        leftCount++;
                        rightwaveform[i] = samples[i];
                        rightSum += sample * sample;
                        rightSum++;
                    }
                    float left = leftCount > 0 ? (float)Math.Sqrt(leftSum / leftCount) : 0f;
                    float right = rightCount > 0 ? (float)Math.Sqrt(rightSum / rightCount) : 0f;
                    left = Math.Clamp(left, 0f, 1f);
                    right = Math.Clamp(right, 0f, 1f);
                    #endregion

                    #region Fast Fourier
                    Complex[] fft = new Complex[AUDIO_SAMPLES];
                    for (int i = 0; i < samples.Length - 1; i++)
                    {
                        float w = 0.5f * (1.0f - (float)Math.Cos(2.0 * Math.PI * i / (AUDIO_SAMPLES - 1)));
                        float s = samples[i] / (float)short.MaxValue;
                        fft[i].X = s * w;
                        fft[i].Y = 0.0f;
                        s = samples[i + 1] / (float)short.MaxValue;
                        fft[i].X = fft[i].X + s * w;
                        if (i > 1)
                        {
                            fft[i - 1].X = (fft[i].X + fft[i - 1].X) / 2f;
                            fft[i + 1].Y = 0.0f;
                        }
                    }
                    FastFourier.Compute(fft);
                    const double hertz = SAMPLE_RATE / (double)FFT_SAMPLES;
                    double h = 0;
                    int bin = 0;
                    var range = GetBarRange(bin, BIN_COUNT);
                    float max = 0f;
                    for (int i = 0; i < BIN_COUNT; i++)
                        bins[i] = 0f;

                    for (int i = 1; i < AUDIO_SAMPLES; i++)
                    {
                        h += hertz;
                        if (h < range[0])
                            continue;
                        float m = fft[i].Magnitude(DECIBELS);
                        if (m > max)
                            max = m;
                        if (h <= range[1] && max > bins[bin])
                            bins[bin] = max;
                        if (h > range[1])
                        {
                            bin++;
                            if (bin >= BIN_COUNT)
                                break;
                            max = m;
                            bins[bin] = max;
                            range = GetBarRange(bin, BIN_COUNT);
                        }
                    }
                    for (int i = 0; i < BIN_COUNT; i++)
                        bins[i] *= bins[i];
                    #endregion

                    #region Rolling
                    leftroll[rollindex] = left;
                    rightroll[rollindex] = right;
                    for (int i = 0; i < BIN_COUNT; i++)
                        binroll[rollindex, i] = bins[i];
                    rollindex = (rollindex + 1) % ROLL;
                    lock (data)
                    {
                        float v = 0f;
                        for (int i = 0; i < ROLL; i++)
                            v += leftroll[i];
                        data.Volume[0] = v / ROLL;
                        data.Volume[1] = data.Volume[0];
                        for (int i = 0; i < BIN_COUNT; i++)
                        {
                            v = 0f;
                            for (int j = 0; j < ROLL; j++)
                                v += binroll[j, i];
                            data.Graph[i] = v / ROLL;
                        }
                    }
                    #endregion
                }
                Sleep(10);
            }
        }
        finally
        {
            SDL_PauseAudioDevice(audio, 1);
            SDL_ClearQueuedAudio(audio);
            SDL_CloseAudioDevice(audio);
            pin.Free();
        }
    }

    void MusicTask()
    {
        const int SAMPLE_RATE = 44100;
        const int FFT_SAMPLES = 4096;
        const int AUDIO_SAMPLES = 2048;
        const int AUDIO_STEREO = 2;
        const int BIN_COUNT = 30;
        const int ROLL = 3;
        const int DECIBELS = 65;

        float[] leftwaveform = new float[AUDIO_SAMPLES];
        float[] rightwaveform = new float[AUDIO_SAMPLES];
        float[] leftroll = new float[ROLL];
        float[] rightroll = new float[ROLL];
        float[] bins = new float[BIN_COUNT];
        float[,] binroll = new float[ROLL, BIN_COUNT];

        int rollindex;

        data = new()
        {
            Volume = new float[2],
            Wave = new float[2, AUDIO_SAMPLES],
            Graph = new float[BIN_COUNT]
        };
        rollindex = 0;

        mpg123_init();
        var decoder = mpg123_new(null, out _);
        mpg123_open(decoder, fileName);
        mpg123_getformat(decoder, out _, out _, out _);
        short[] samples = new short[AUDIO_SAMPLES * AUDIO_STEREO];
        byte[] buffer = new byte[AUDIO_SAMPLES * AUDIO_STEREO * sizeof(short)];
        SDL_AudioSpec want = new SDL_AudioSpec
        {
            freq = SAMPLE_RATE,
            format = AUDIO_S16LSB,
            channels = AUDIO_STEREO,
            samples = AUDIO_SAMPLES,
            callback = null
        };
        var audio = SDL_OpenAudioDevice(null, 0, ref want, out SDL_AudioSpec obtained, 0);
        if (audio == 0)
        {
            WriteLine("Failed to open audio device: " + SDL_GetError());
            playing = false;
            return;
        }
        if (obtained.channels != AUDIO_STEREO || obtained.format != AUDIO_S16LSB)
        {
            SDL_CloseAudioDevice(audio);
            WriteLine("Failed to get desired audio format: " + SDL_GetError());
            playing = false;
            return;
        }

        SDL_PauseAudioDevice(audio, 0);
        GCHandle handle = GCHandle.Alloc(samples, GCHandleType.Pinned);
        float secondsPerSample = 1.0f / obtained.freq;
        float totalSamplesPlayed = 0;
        var stopwatch = Stopwatch.StartNew();
        try
        {
            while (playing)
            {
                #region Read Audio
                int result = mpg123_read(decoder, buffer, buffer.Length, out int done);
                if (result == MPG123_DONE || done == 0)
                    return;
                Buffer.BlockCopy(buffer, 0, samples, 0, done);
                int samplesThisFrame = done / (sizeof(short) * obtained.channels);
                double timeShouldHaveElapsed = totalSamplesPlayed * secondsPerSample;
                double timeActuallyElapsed = stopwatch.Elapsed.TotalSeconds;
                double sleepTime = timeShouldHaveElapsed - timeActuallyElapsed;
                Sleep(Math.Max(1, (int)(sleepTime * 1000)));
                SDL_QueueAudio(audio, handle.AddrOfPinnedObject(), (uint)done);
                totalSamplesPlayed += samplesThisFrame;
                #endregion

                #region Volume
                float leftSum = 0f, rightSum = 0f;
                int leftCount = 0, rightCount = 0;
                for (int i = 0; i < samples.Length; i++)
                {
                    float sample = Math.Abs(samples[i] / 24000f);
                    if (sample > 1f) sample = 1f;
                    if (i % 2 == 0)
                    {
                        leftwaveform[i / 2] = samples[i] / (float)short.MaxValue;
                        leftSum += sample * sample;
                        leftCount++;
                    }
                    else
                    {
                        rightwaveform[i / 2] = samples[i] / (float)short.MaxValue;
                        rightSum += sample * sample;
                        rightCount++;
                    }
                }
                float left = leftCount > 0 ? (float)Math.Sqrt(leftSum / leftCount) : 0f;
                float right = rightCount > 0 ? (float)Math.Sqrt(rightSum / rightCount) : 0f;
                left = Math.Clamp(left, 0f, 1f);
                right = Math.Clamp(right, 0f, 1f);
                #endregion

                #region Fast Fourier
                Complex[] fft = new Complex[AUDIO_SAMPLES * 2];
                for (int i = 0; i < AUDIO_SAMPLES; i++)
                {
                    float w = 0.5f * (1.0f - (float)Math.Cos(2.0 * Math.PI * i / (AUDIO_SAMPLES - 1)));
                    float s = samples[i * 2] / (float)short.MaxValue;
                    fft[i * 2].X = s * w;
                    fft[i * 2].Y = 0.0f;
                    s = samples[i * 2 + 1] / (float)short.MaxValue;
                    fft[i * 2].X = fft[i * 2].X + s * w;
                    if (i > 1)
                    {
                        fft[i * 2 - 1].X = (fft[i * 2].X + fft[(i - 1) * 2].X) / 2f;
                        fft[i * 2 + 1].Y = 0.0f;
                    }
                }

                FastFourier.Compute(fft);
                const double hertz = SAMPLE_RATE / (double)FFT_SAMPLES;
                double h = 0;
                int bin = 0;
                var range = GetBarRange(bin, BIN_COUNT);
                float max = 0f;
                for (int i = 0; i < BIN_COUNT; i++)
                    bins[i] = 0f;

                for (int i = 1; i < AUDIO_SAMPLES; i++)
                {
                    h += hertz;
                    if (h < range[0])
                        continue;
                    float m = fft[i].Magnitude(DECIBELS);
                    if (m > max)
                        max = m;
                    if (h <= range[1] && max > bins[bin])
                        bins[bin] = max;
                    if (h > range[1])
                    {
                        bin++;
                        if (bin >= BIN_COUNT)
                            break;
                        max = m;
                        bins[bin] = max;
                        range = GetBarRange(bin, BIN_COUNT);
                    }
                }

                for (int i = 0; i < BIN_COUNT; i++)
                    bins[i] *= bins[i];
                #endregion

                leftroll[rollindex] = left;
                rightroll[rollindex] = right;
                for (int i = 0; i < BIN_COUNT; i++)
                    binroll[rollindex, i] = bins[i];
                rollindex = (rollindex + 1) % ROLL;
                lock (data)
                {
                    // Get the rolling left volume average
                    float v = 0f;
                    for (int i = 0; i < ROLL; i++)
                        v += leftroll[i];
                    data.Volume[0] = v / ROLL;
                    // Get the rolling right volume average
                    v = 0f;
                    for (int i = 0; i < ROLL; i++)
                        v += rightroll[i];
                    data.Volume[1] = v / ROLL;
                    int n = leftwaveform.Length;
                    Buffer.BlockCopy(leftwaveform, 0, data.Wave, 0, n * sizeof(float));
                    Buffer.BlockCopy(rightwaveform, 0, data.Wave, n * sizeof(float), n * sizeof(float));
                    for (int i = 0; i < BIN_COUNT; i++)
                    {
                        v = 0f;
                        for (int j = 0; j < ROLL; j++)
                            v += binroll[j, i];
                        data.Graph[i] = v / ROLL;
                    }
                }
                Sleep(1);
            }
        }
        finally
        {
            SDL_PauseAudioDevice(audio, 1);
            SDL_ClearQueuedAudio(audio);
            SDL_Delay(100);
            SDL_CloseAudioDevice(audio);
            handle.Free();
            mpg123_close(decoder);
            mpg123_delete(decoder);
            mpg123_exit();
            musicTask = null;
            music = null;
            playing = false;
            _ = Program.Events.Broadcast("music", "''");
        }
    }
}
