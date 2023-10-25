
import Game from "../Game";
import RectangleNet from "./RectangleNet";
import ScoreNet from "./ScoreNet";


const { ccclass, property } = cc._decorator;
/**游戏主界面 */
@ccclass
export default class NetRequest extends cc.Component {
    // private xhttp: XMLHttpRequest = null;
    // private xhttp2: XMLHttpRequest = null;

    // /**积分更新 */
    // private readonly scoreURL = "http://client.megafunstudio.com/ur?q=";
    // /**排行榜 top用户 */
    // private readonly rankURL = " http://client.megafunstudio.com/gr?q=";
    // /**获取当前⽤户前后N个⽤户的排名 */
    // private readonly frontAndAfterURL = "http://client.megafunstudio.com/gr?q=";

    private scoreNet: ScoreNet = null;
    private rectNet: RectangleNet = null;


    protected onLoad(): void {
        this.Init();
    }

    private Init() {
        this.rectNet = new RectangleNet();
        this.scoreNet = new ScoreNet();
    }


    /**更新分数 */
    public UpdateScore(score: number, userName: string = "") {
        this.scoreNet.UpdateScore(score, userName);
    }

    /**更新田字格消除数*/
    public UpdateRectangleNum(num: number, username: string = "") {
        this.rectNet.UpdateRectangleNum(num, username);
    }


    /** 分数自己前面和后面玩家排名 
     * @param num 多少名
    */
    public GetScoreFrontAndAfterRankList(uid: number = -1, num: number = 200) {
        this.scoreNet.GetScoreFrontAndAfterRankList(uid, num);
    }

    /**田字格 自己前面和后面玩家排名 
     * @param num 多少名
    */
    public GetRectangleFrontAndAfterRankList(uid: number = -1, num: number = 200) {
        this.rectNet.GetRectangleFrontAndAfterRankList(uid, num);
    }

    // public GetRectangleTopRankList() {
    //     this.rectNet.GetTopRankList();
    // }

    public GetScoreTopRankList() {
        this.scoreNet.GetTopRankList();
    }


}