export default class ComboTips extends fgui.GComponent {
    private comboText: fgui.GTextField = null;
    protected onConstruct(): void {
        this.comboText = this.getChild("ScoreText").asTextField;
    }

    public SetData(comboCount: number) {
        this.comboText.text = `${comboCount}x Combo!`;
    }
}