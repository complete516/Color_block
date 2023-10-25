export default class ScoreTips extends fgui.GComponent {
    private scoreText: fgui.GTextField = null;

    onConstruct() {
        this.scoreText = this.getChild("ScoreText").asCom.getChild("ScoreText").asTextField;
    }


    public SetData(score: number) {
        this.scoreText.text = `${score}`;
    }

}