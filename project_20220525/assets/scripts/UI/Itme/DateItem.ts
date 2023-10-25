import Game from "../../Game";

export enum StatusType {
    Finish,
    Start,
    Unlock,
    Lock,
}

export enum SelectType {
    Select,
    UnSelect,
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class DateItem extends fgui.GComponent {

    private textList: fgui.GTextField[] = [];
    /**选中控制器 */
    private statusController: fgui.Controller = null;
    /**状态控制器 */
    private selectController: fgui.Controller = null;
    /** 解锁*/
    private isUnLock: boolean = false;
    /**进度条 */
    private progress: fgui.GProgressBar = null;
    /**特效*/
    private starTran: fgui.Transition = null;

    private row: number = 0;

    public OnTranComplete: Function = null;

    protected onConstruct(): void {
        this.progress = this.getChild("n3").asProgress;
        this.starTran = this.getTransition("tainchong_move");
        let textList = ["n0", "n6", "n8"];
        for (let str of textList) {
            let tx = this.getChild(str).asTextField;
            this.textList.push(tx);
        }

        this.statusController = this.getController("c1");
        this.selectController = this.getController("c2");

        this.selectController.setSelectedIndex(1);
        this.statusController.setSelectedIndex(3);
    }

    public SetData(month: number, day: number, targetDate: { month: number, day: number }, row: number) {
        for (let tx of this.textList) {
            tx.text = day.toString();
        }

        this.isUnLock = true;
        let data = Game.Instance.GetDateProgress(month, day);
        if (data.isLock) {
            this.statusController.setSelectedIndex(StatusType.Lock);
            this.isUnLock = false;
        } else {
            if (data.history == 0) {
                if (data.currentScore > 0) {
                    this.statusController.setSelectedIndex(StatusType.Start);
                    this.progress.value = (data.currentScore / data.maxScore) * 100;
                } else {
                    this.statusController.setSelectedIndex(StatusType.Unlock);
                }
            } else {
                if (targetDate && targetDate.day == day - 1) {
                    this.statusController.setSelectedIndex(StatusType.Unlock);
                } else {
                    this.statusController.setSelectedIndex(StatusType.Finish);
                }
            }
        }
        this.SetSelectState(false);
        this.row = row;
    }

    public IsUnlock() {
        return this.isUnLock;
    }

    public PlayTrans() {
        this.starTran.timeScale = 2.5;
        this.starTran.play(() => {
            this.OnTranComplete && this.OnTranComplete();
        });
    }



    public Finish() {
        this.statusController.setSelectedIndex(StatusType.Finish);
    }

    /**选中状态 */
    public SetSelectState(isSelect: boolean) {
        this.selectController.setSelectedIndex(isSelect ? SelectType.Select : SelectType.UnSelect);
    }

    /**显示瀑布动画 */
    public ShowWaterfallAction() {
        fgui.GTween.delayedCall(this.row * 0.2).onComplete(() => {
            this.PlayTrans();
        })
    }


}
