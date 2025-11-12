namespace Lights;

public class LightStrip
{
    public struct Range
    {
        public int low;
        public int high;
    }

    private int sectionCount;
    private int lightCount;
    private int[] data;
    private Range[] range;

    public int SectionCount => sectionCount;
    public int LightCount => lightCount;

    public void Assign(LightStrip source)
    {
        sectionCount = source.sectionCount;
        lightCount = source.lightCount;
        if (data.Length == source.data.Length)
            for (var i = 0; i < data.Length; i++)
                data[i] = source.data[i];
        else
            data = [.. source.data];
        if (range.Length == source.range.Length)
            for (var i = 0; i < range.Length; i++)
                range[i] = source.range[i];
        else
            range = [.. source.range];
    }

    public LightStrip()
    {
        sectionCount = 15;
        data = new int[sectionCount];
        range = new Range[sectionCount];
        var index = 0;
        for (var i = 0; i < sectionCount; i++)
        {
            data[i] = 50;
            range[i] = new Range()
            {
                low = index,
                high = index + data[i] - 1
            };
            index += data[i];
        }
        lightCount = index;
    }

    public void Compact()
    {
        data = data.Where(n => n >= 6).ToArray();
        FromString(ToString());
    }

    public void FromString(string s)
    {
        data = [.. s
            .Split(',')
            .Select(s => s.Trim())
            .Where(s => !string.IsNullOrEmpty(s))
            .Select(int.Parse)];
        sectionCount = data.Length;
        range = new Range[sectionCount];
        var index = 0;
        for (var i = 0; i < sectionCount; i++)
        {
            range[i] = new Range()
            {
                low = index,
                high = index + data[i] - 1
            };
            index += data[i];
        }
        lightCount = index;
    }

    public override string ToString() => string.Join(", ", data);

    public Range LightToRange(int light)
    {
        for (int i = 0; i < sectionCount; i++)
            if (light >= range[i].low && light <= range[i].high)
                return range[i];
        return new Range()
        {
            low = -1,
            high = 1
        };
    }

    public Range SectionToRange(int section)
    {
        if (section > -1 && section < range.Length - 2)
            return range[section];
        return new Range()
        {
            low = -1,
            high = 1
        };
    }

    public int LightToSection(int light)
    {
        for (int i = 0; i < sectionCount; i++)
            if (light >= range[i].low && light <= range[i].high)
                return i;
        return -1;
    }

    public void UpdateSection(int section, int count)
    {
        if (section < 0 || section > sectionCount - 1)
            return;
        if (count < 5 || count > 700)
            return;
        data[section] = count;
        var index = 0;
        for (var i = 0; i < sectionCount; i++)
        {
            range[i] = new Range()
            {
                low = index,
                high = index + data[i] - 1
            };
            index += data[i];
        }
        lightCount = index;
    }
}