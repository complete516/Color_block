export default class AllTimeScoreTips extends fgui.GComponent {
    private recordText: fgui.GTextField = null;
    protected onConstruct(): void {
        this.recordText = this.getChild("ScoreText").asTextField;
    }

    public SetData(recordstr: string) {
        this.recordText.text = recordstr+" Best Score";
    }
}