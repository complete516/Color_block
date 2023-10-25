import Consts from "../Consts/Consts";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";
import Utility from "../Utility";
import BaseNet from "./BaseNet";

export default class ScoreNet extends BaseNet {
    private isSelf: boolean = true;
    /**更新田字格消除数*/
    public UpdateScore(num: number, userName: string) {
        this.UpdateUserScore(num, userName);
    }

    /**获取田字格排行 */
    public GetScoreFrontAndAfterRankList(uid: number = -1, num: number = 50) {
        this.isSelf = true;
        if (uid != -1) {
            this.isSelf = false;
        }
        Utility.DebugLog(num + " " + uid.toString() + "FrontAndAfterRankList");
        this.FrontAndAfterRankList(num, uid);
    }

    protected SetRankData(data: any): void {
        if (data.user && this.isSelf) {
            let user = Game.Instance.Data.User;
            user.name = data.user.uname;
            user.sorder = data.user.order;
            user.stotal = data.total;
            user.uid = data.user.uid;
            user.score = parseInt(data.user.score);
            if (user.score > Game.Instance.Score.History) {
                Game.Instance.Score.History = user.score;
            }
            user.score = Game.Instance.Score.History;
            Game.Instance.Data.User = user;
        }

        if (data.rank_list && data.rank_list.length > 0) {
            if (data.user && this.isSelf) {
                Game.Instance.Data.UpdateScoreRandList(data.rank_list);
            }
            Game.Instance.Cache.UpdateScoreRankList(data.rank_list);
        }

        if (data.rank_list) {
            Utility.DebugLog("SetRankData ->" + data.rank_list.length);
        }

    }

    /**设置前几名排行*/
    protected SetTopRankData(data: any): void {
        if (data.rank_list && data.rank_list.length > 0) {
            Game.Instance.Data.TopScoreRankList = data.rank_list;
            // GameEventMgr.Instance.EmitEvent(Consts.Event.ETopRankData);
            // Game.Instance.Cache.UpdateScoreRankList(data.rank_list);
        }

        // cc.log(data);


        // if (data.user) {
        //     Game.Instance.Data.User.name = data.user.uname || Game.Instance.Data.User.name;
        //     Game.Instance.Data.User.uid = data.user.uid || 0;
        //     Game.Instance.Data.User.uid2 = Game.Instance.Data.User.uid2 || 0;
        // }

        // Utility.DebugLog("SetTopRankData");

    }

    /**更新分数完成*/
    protected UpdateScoreFinish(): void {
        this.GetScoreFrontAndAfterRankList();
        Game.Instance.Data.RequestScore = Game.Instance.Score.History;
    }

    protected GetGameId(): number {
        return 1007;
    }
}