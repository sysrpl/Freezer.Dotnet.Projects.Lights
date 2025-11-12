using System.Drawing;

namespace Lights;

public partial class HomePage : PageHandler
{
    [Action("effects-set-effect")]
    public void EffectsSetEffect() => state.Effect = Read("effect");

    [Action("effects-set-shuffe")]
    public void EffectsSetShuffle() => state.Shuffle(Read("items"));

    [Action("effects-set-color")]
    public void EffectsSetColor()
    {
        if (Read("color").TryParseColor(out Color color))
            state.Color = color;
    }
}