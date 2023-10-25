import Consts from "../Consts/Consts";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";
import Utility from "../Utility";

export default class BaseNet {
    private xhttp: XMLHttpRequest = null;
    private topHttp: XMLHttpRequest = null;
    private rankHttp: XMLHttpRequest = null;
    // color.abcredir.com
    /**积分更新 */
    protected readonly scoreURL = "http://color.abcredir.com/ur?q=";
    /**排行榜 top用户 */
    protected readonly topUrl = "http://color.abcredir.com/gr?q=";
    /**获取当前⽤户前后N个⽤户的排名 */
    protected readonly frontAndAfterURL = "http://color.abcredir.com/gru?q=";

    constructor() {
        this.xhttp = new XMLHttpRequest();
        this.topHttp = new XMLHttpRequest();
        this.rankHttp = new XMLHttpRequest();

        this.Init();
    }

    private Init() {
        this.xhttp.onerror = this.OnNetworkError.bind(this);
        this.xhttp.ontimeout = this.OnTimeout.bind(this);
        this.xhttp.onload = this.OnHttpLoad.bind(this);

        this.topHttp.onload = this.OnTopLoad.bind(this);
        this.topHttp.onerror = this.OnNetworkError.bind(this);

        this.rankHttp.onload = this.OnRankListLoad.bind(this);
        this.rankHttp.onerror = this.OnNetworkError.bind(this);
    }

    private OnHttpLoad() {
        if (this.xhttp.status == 200 && this.xhttp.readyState == 4) {
            Game.Instance.Cache.networkerror = false;

            let json = JSON.parse(this.xhttp.responseText);

            if (json.code == 0) {
                this.UpdateScoreFinish();
            }
        } else {
            cc.log("错误");
        }
    }

    private OnTopLoad() {
        if (this.topHttp.status == 200 && this.topHttp.readyState == 4) {
            cc.log("TTTTTTTTTTTTTTTT",this.topHttp);
            Game.Instance.Cache.networkerror = false;
            let json = JSON.parse(this.topHttp.responseText);
            if (json.code == 0) {
                if (json.data) {
                    this.SetTopRankData(json.data);
                    // this.SetRankData(json.data);
                }
            }
        } else {
            cc.log("错误");
        }
    }


    private OnRankListLoad() {
        if (this.rankHttp.status == 200 && this.rankHttp.readyState == 4) {
            Game.Instance.Cache.networkerror = false;
            // cc.log(this.rankHttp)

            let json = JSON.parse(this.rankHttp.responseText);
            if (json.code == 0) {
                if (json.data) {
                    this.SetRankData(json.data);
                    let rankList = json.data.rank_list;
                    if (rankList && rankList.length > 0) {
                        // Utility.DebugLog("OnRankListLoad " + rankList.length.toString());
                        GameEventMgr.Instance.EmitEvent(Consts.Event.EUpdateRankData);
                    }
                }
            }
        } else {
            cc.log("错误");
        }
    }



    protected UpdateScoreFinish() {

    }

    protected SetRankData(data: any) {

    }

    protected SetTopRankData(data: any) {

    }

    /**网络错误 */
    private OnNetworkError() {
        cc.log("OnNetworkError错误")
        Game.Instance.Cache.networkerror = true;
        GameEventMgr.Instance.EmitEvent(Consts.Event.ENetworkError);
        Utility.DebugLog("OnNetworkError-net workError");
    }

    /**超时 */
    private OnTimeout() {
        Utility.DebugLog("OnTimeout")
    }

    private Decode(word: string) {
        return window.btoa(word);
        // return  window.btoa((encodeURIComponent(word)));
    }

    private JoinUrl(url: string, word: string) {
        // cc.log(word);
        return `${url}${this.Decode(word)}&encrypt=8002`;
    }

    /**请求*/
    protected RequestUpdate(url: string, data: object, num: number) {
        let json = JSON.stringify(data);
        let fullurl = this.JoinUrl(url, json);

        this.xhttp.open("GET", fullurl);
        this.xhttp.send();

        Utility.DebugLog(fullurl + " RequestUpdate-->");
    }

    protected RequestRank(url: string, data: object, num: number) {
        let json = JSON.stringify(data);
        let fullurl = this.JoinUrl(url, json);
        this.rankHttp.open("GET", fullurl);
        this.rankHttp.send();
        // Utility.DebugLog(fullurl + " RequestRank-->");
    }

    protected RequestTopRank(url: string, data: object, num: number) {
        let json = JSON.stringify(data);
        let fullurl = this.JoinUrl(url, json);
        this.topHttp.open("GET", fullurl);
        this.topHttp.send();
        Utility.DebugLog(fullurl + " RequestTopRank-->");
    }


    protected UpdateUserScore(score: number, userName: string) {
        if (userName == "") {
            let data = {
                game_id: this.GetGameId(),
                uid: this.GetUserId(),
                score: score,
            }
            this.RequestUpdate(this.scoreURL, data, 0);
        } else {
            let data = {
                game_id: this.GetGameId(),
                uid: this.GetUserId(),
                score: score,
                uname: userName,
            }
            this.RequestUpdate(this.scoreURL, data, 0);
        }
    }



    protected FrontAndAfterRankList(num: number, uid: number = -1) {
        if (uid == -1) {
            let data = {
                game_id: this.GetGameId(),
                uid: this.GetUserId(),
                n: num
            }
            this.RequestRank(this.frontAndAfterURL, data, 1);
        } else {
            let data = {
                game_id: this.GetGameId(),
                uid: uid,
                n: num
            }
            this.RequestRank(this.frontAndAfterURL, data, 1);
        }
    }

    public GetTopRankList(num: number = 50) {
        let data = {
            game_id: this.GetGameId(),
            uid: this.GetUserId(),
            topn: num
        }
        // cc.log(data, "GetTopRankList");
        this.RequestTopRank(this.topUrl, data, 2);
    }

    protected GetGameId() {
        return 0;
    }

    protected GetUserId() {
        if (Game.Instance.Cache.IsLogin) {
            return Game.Instance.Cache.Account.id;
        }
        return Game.Instance.Data.MyId;
    }

}