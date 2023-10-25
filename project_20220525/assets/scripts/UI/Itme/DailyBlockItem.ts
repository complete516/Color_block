import Consts from "../../Consts/Consts";
import Game from "../../Game";

export default class DailyBlockItem {
    private dailyDayText: fgui.GTextField = null;
    private controller: fgui.Controller = null;

    constructor(com: fgui.GComponent) {
        this.dailyDayText = com.getChild("DailyDay").asTextField;
        let date = Game.Instance.Date;
        let m = Consts.Months[date.Month - 1];
        this.dailyDayText.text = `${m} ${date.Day}`;
        this.controller = com.getController("c1");
    }

    public UpdateState(index: number) {
        this.controller.setSelectedIndex(index);
    }
}