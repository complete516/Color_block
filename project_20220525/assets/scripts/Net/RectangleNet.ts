import Consts from "../Consts/Consts";
import GameData from "../Data/GameData";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";
import BaseNet from "./BaseNet";

export default class RectangleNet extends BaseNet {
    private isSelf: boolean = true;
    /**更新田字格消除数*/
    public UpdateRectangleNum(num: number, userName: string = "") {
        this.UpdateUserScore(num, userName);
    }

    /**获取田字格排行 */
    public GetRectangleFrontAndAfterRankList(uid: number = -1, num: number = 50) {
        this.isSelf = true;
        if (uid != -1) {
            this.isSelf = false;
        }
        this.FrontAndAfterRankList(num, uid);
    }

    /**设置排行数据 */
    protected SetRankData(data: any): void {
        if (data.rank_list && data.rank_list.length > 0) {
            if (data.user && this.isSelf) {
                let user = Game.Instance.Data.User;
                // user.name = data.user.uname;
                // user.combo = parseInt(data.user.score);
                user.corder = data.user.order || 0;
                user.ctotal = data.total;
                user.uid2 = data.user.uid || 0;
                // cc.log(user, data.user, "SetRankData2222")
                user = user;
                if (data.combo > Game.Instance.Data.Square) {
                    Game.Instance.Data.Square = user.combo;
                }
                Game.Instance.Data.UpdateSquareRandList(data.rank_list);
            }
            Game.Instance.Cache.UpdateSquareRankList(data.rank_list);
        }
        // this.GetTopRankList();

    }

    protected SetTopRankData(data: any): void {
        cc.log(data, "SetTopRankData");
        if (data.rank_list && data.rank_list.length > 0) {
            Game.Instance.Data.TopSquareRankList = data.rank_list;
            GameEventMgr.Instance.EmitEvent(Consts.Event.ETopRankData);
        }

        if (data.user) {
            Game.Instance.Data.User.uid2 = data.user.uid || 0;
        }
    }

    protected UpdateScoreFinish(): void {
        this.GetRectangleFrontAndAfterRankList();
        // this.GetTopRankList();
    }

    protected GetGameId(): number {
        return 1008;
    }
}