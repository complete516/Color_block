import Consts from "../Consts/Consts";
import Game from "../Game";
import Utility from "../Utility";



export default class GameData {
    private soundOff: number = 0;
    private vibrateOff: number = 0;
    private isChange: boolean = false;
    private openFirst: boolean = false;
    /**排行数据 */
    private scoreRandList: { uname: string, order: number, score: string, uid: number }[] = [];
    private squareRandList: { uname: string, order: number, score: string, uid: number }[] = [];
    private topScoreRankList: { uname: string, order: number, score: string, uid: number }[] = [];
    private topSquareRankList: { uname: string, order: number, score: string, uid: number }[] = [];
    /**帮助数据 */
    private helpData: { num: number, round: number } = { num: 0, round: 0 };
    /**自己的ID */
    private myId: string = "";
    private squareCount: number = 0;
    private userData: { name: string, sorder: number, corder: number, score: number, combo: number, ctotal: number, stotal: number, uid: number, uid2: number } = null;
    /**请求分数*/
    private requestScore: number = 0;

    /**方块仓库 */
    private blockWarehouse: { blockType: number, tileColor: number[] }[] = [];

    constructor() {
        this.ReadData();
    }

    private ReadData() {
        let data = cc.sys.localStorage.getItem(this.ItemKey);
        if (data) {
            let json = JSON.parse(data);
            this.soundOff = json.sound || this.soundOff;
            this.vibrateOff = json.vibrate || this.vibrateOff;
            this.helpData = json.help || this.helpData;
            this.openFirst = json.first || this.openFirst;
            this.scoreRandList = json.rand || this.scoreRandList;
            this.squareRandList = json.combo || this.squareRandList;
            this.squareCount = json.square || this.squareCount;
            this.myId = json.myId || this.myId;
            this.userData = json.userData || this.userData;
            this.topScoreRankList = json.scoreTop || this.topScoreRankList;
            this.topSquareRankList = json.squareTop || this.topSquareRankList;
            this.requestScore = json.requestScore || this.requestScore;
            // this.blockWarehouse = json.warehouse || this.blockWarehouse;
        }

        if (this.userData == null) {
            this.userData = { name: "", sorder: -1, corder: -1, score: 0, combo: 0, stotal: 0, ctotal: 0, uid: 0, uid2: 0 };
            if (this.userData.name == "") {
                let randomStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
                let ffix = ""
                for (let i = 0; i < 5; i++) {
                    ffix += randomStr[Utility.RandomRangeInt(0, randomStr.length - 1)];
                }
                this.userData.name = "Player_" + ffix;
                cc.log(this.userData.name);
            }
        }

    }

    public WriteData() {
        if (this.isChange) {
            let data = {
                sound: this.soundOff,
                vibrate: this.vibrateOff,
                help: this.helpData,
                first: this.openFirst,
                rand: this.scoreRandList,
                combo: this.squareRandList,
                square: this.squareCount,
                myId: this.myId,
                userData: this.userData,
                scoreTop: this.topScoreRankList,
                squareTop: this.topSquareRankList,
                requestScore: this.requestScore,
                // warehouse: this.blockWarehouse,
            }
            cc.sys.localStorage.setItem(this.ItemKey, JSON.stringify(data));
        }


    }

    public set SoundOff(value: number) {
        this.soundOff = value;
        this.isChange = true;
    }

    public get SoundOff() {
        return this.soundOff;
    }

    public set VibrateOff(value: number) {
        this.vibrateOff = value;
        this.isChange = true;
    }

    public get VibrateOff() {
        return this.vibrateOff;
    }

    public get First() {
        return this.openFirst;
    }

    public set First(value: boolean) {
        this.openFirst = value;
        this.isChange = true;
    }

    public IsCanHelp() {
        return this.helpData.num <= 5 && this.helpData.round < 2;
    }

    /**获取游戏轮数 */
    public GetHelpData() {
        return this.helpData;
    }

    public AddRound() {
        this.helpData.round++
        this.helpData.round = Math.min(this.helpData.round, 2);
        this.isChange = true;
    }

    /**增加局数 */
    public AddNum() {
        this.helpData.num++;
        this.helpData.round = 0;
        this.isChange = true;

    }

    /**获取分数排行列表*/
    public GetScoreRandList() {
        return this.scoreRandList;
    }


    public GetSquareRandList() {
        return this.squareRandList
    }

    /**更新分数消除 */
    public UpdateScoreRandList(ranList: { uname: string, order: number, score: string, uid: number }[]) {
        this.scoreRandList = ranList;
        this.UpdateSelfScore();
        this.isChange = true;
    }

    /**更新自己分数 */
    public UpdateSelfScore() {

        if (this.scoreRandList.length == 0) {
            return;
        }

        let firstOrder = this.scoreRandList[0].order;
        let fList = this.scoreRandList.filter((item) => item.uid == this.userData.uid);
        if (fList.length > 0) {
            fList[0].score = this.userData.score.toString();
        }

        // this.UpdateTopScoreRank();
        this.scoreRandList.sort((a, b) => {
            return parseInt(b.score) - parseInt(a.score);
        });

        if (this.scoreRandList.length > 0) {
            for (let i = 0; i < this.scoreRandList.length; i++) {
                let item = this.scoreRandList[i];
                item.order = firstOrder;
                if (item.uid == Game.Instance.Data.userData.uid) {
                    Game.Instance.Data.userData.sorder = item.order;
                }
                firstOrder++;
            }
        }
    }


    /**更新田字格消除 */
    public UpdateSquareRandList(ranList: { uname: string, order: number, score: string, uid: number }[]) {
        this.squareRandList = ranList;
        this.UpdateSelfSquare();
        this.isChange = true;
    }

    public UpdateSelfSquare() {
        if (this.squareRandList.length == 0) {
            return;
        }

        let firstorder = this.squareRandList[0].order;
        let fList = this.squareRandList.filter((item) => item.uid == this.userData.uid2);
        if (fList.length > 0) {
            fList[0].score = this.userData.combo.toString();
        }

        // this.UpdateTopSquareRank();
        this.squareRandList.sort((a, b) => {
            return parseInt(b.score) - parseInt(a.score);
        });

        for (let i = 0; i < this.squareRandList.length; i++) {
            let item = this.squareRandList[i];
            item.order = firstorder;
            if (item.uid == Game.Instance.Data.userData.uid2) {
                Game.Instance.Data.userData.corder = item.order;
            }
            firstorder++;
        }
    }


    /**增加田字格消除数 */
    public AddSquare() {
        this.squareCount++;
        this.userData.combo = this.squareCount;
        this.UpdateSelfSquare();
        this.isChange = true;
    }

    /**田字格消出数 */
    public get Square() {
        return this.squareCount;
    }

    public set Square(value: number) {
        this.squareCount = value;
        this.isChange = true;
    }

    /**自己的ID*/
    public get MyId() {
        if (this.myId == "") {
            this.MyId = cc.sys.localStorage.getItem(Consts.GameName + "gaid");
        }
        return this.myId;
    }

    /**用户名字 */
    public get User() {
        return this.userData;
    }

    public set User(value: { name: string, corder: number, sorder: number, score: number, combo: number, ctotal: number, stotal: number, uid: number, uid2: number }) {
        this.userData = value;
        this.isChange = true;
    }

    public set MyId(value: string) {
        this.myId = value;
        this.isChange = true;
    }

    public set TopScoreRankList(topRank: { uname: string, order: number, score: string, uid: number }[]) {
        this.topScoreRankList = topRank;
        // this.UpdateTopScoreRank();
        this.isChange = true;
    }

    private UpdateTopScoreRank() {
        if (this.scoreRandList.length == 0) {
            return;
        }

        let fList = this.scoreRandList.filter((item) => item.uid == this.userData.uid);
        let topList = this.topScoreRankList.filter((item) => item.uid == this.userData.uid);
        if (topList.length > 0) {
            topList[0].score = this.userData.score.toString();
            this.topScoreRankList.sort((a, b) => {
                return parseInt(b.score) - parseInt(a.score);
            });
            for (let i = 0; i < this.topScoreRankList.length; i++) {
                let item = this.topScoreRankList[i];
                item.order = i + 1;
                if (item.uid == Game.Instance.Data.userData.uid) {
                    Game.Instance.Data.userData.sorder = item.order;
                }
            }
        } else {
            let index = -1;
            for (let i = 0; i < this.topScoreRankList.length; i++) {
                let item = this.topScoreRankList[i];
                if (parseInt(item.score) < this.userData.score) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                index = 2;
                let item = this.topScoreRankList[index];
                this.topScoreRankList.splice(index, 1);
                this.topScoreRankList.push(fList[0]);

                this.topScoreRankList.sort((a, b) => {
                    return parseInt(b.score) - parseInt(a.score);
                });

                for (let i = 0; i < this.topScoreRankList.length; i++) {
                    let item = this.topScoreRankList[i];
                    item.order = i + 1;
                    if (item.uid == Game.Instance.Data.userData.uid) {
                        Game.Instance.Data.userData.sorder = item.order;
                    }
                }

                let fitem = this.scoreRandList.filter((value) => value.uid == item.uid);
                if (fitem.length == 0) {
                    let ix = this.scoreRandList.indexOf(fList[0]);
                    if (ix != -1) {
                        this.scoreRandList.splice(ix, 1);
                    }
                    this.scoreRandList.push(item);
                }
            }
        }
    }

    public get TopScoreRankList() {
        return this.topScoreRankList;
    }

    public set TopSquareRankList(topRank: { uname: string, order: number, score: string, uid: number }[]) {
        this.topSquareRankList = topRank;
        this.UpdateTopSquareRank();
        this.isChange = true;
    }

    public UpdateTopSquareRank() {
        if (this.squareRandList.length == 0) {
            return;
        }

        let fList = this.squareRandList.filter((item) => item.uid == this.userData.uid2);
        let topList = this.topSquareRankList.filter((item) => item.uid == this.userData.uid2);
        if (topList.length > 0) {
            topList[0].score = this.userData.combo.toString();
            this.topSquareRankList.sort((a, b) => {
                return parseInt(b.score) - parseInt(a.score);
            });
            for (let i = 0; i < this.topSquareRankList.length; i++) {
                let item = this.topSquareRankList[i];
                item.order = i + 1;
                if (item.uid == Game.Instance.Data.userData.uid2) {
                    Game.Instance.Data.userData.sorder = item.order;
                }
            }
        } else {
            let index = -1;
            for (let i = 0; i < this.topSquareRankList.length; i++) {
                let item = this.topSquareRankList[i];
                if (parseInt(item.score) < this.userData.combo) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                index = 2;
                let item = this.topSquareRankList[index];
                this.topSquareRankList.splice(index, 1);
                this.topSquareRankList.push(fList[0]);

                this.topSquareRankList.sort((a, b) => {
                    return parseInt(b.score) - parseInt(a.score);
                });

                for (let i = 0; i < this.topSquareRankList.length; i++) {
                    let item = this.topSquareRankList[i];
                    item.order = i + 1;
                    if (item.uid == Game.Instance.Data.userData.uid2) {
                        Game.Instance.Data.userData.sorder = item.order;
                    }
                }

                let fitem = this.squareRandList.filter((value) => value.uid == item.uid);
                if (fitem.length == 0) {
                    let ix = this.squareRandList.indexOf(fList[0]);
                    if (ix != -1) {
                        this.squareRandList.splice(ix, 1);
                    }
                    this.squareRandList.push(item);
                }
            }
        }
    }


    public get TopSquareRankList() {
        return this.topSquareRankList;
    }

    private get ItemKey() {
        return Consts.GameName + "_GameData";
    }

    /**请求的分数 */
    public set RequestScore(score: number) {
        this.requestScore = score
    }

    public get RequestScore() {
        return this.requestScore;
    }

    /**仓库 */
    public get BlockWarehouse() {
        return this.blockWarehouse;
    }

    /**/
    public set BlockWarehouse(value: { blockType: number, tileColor: number[] }[]) {
        this.blockWarehouse = value;
        // this.isChange = true;
    }
}