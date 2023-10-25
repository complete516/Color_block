import Consts from "../Consts/Consts";
import Game from "../Game";
import Utility from "../Utility";

/**游戏分数 */
export default class GameScore {

    /**当天最高分 */
    private dayHighestScore: number = Consts.Constant.Day;
    /**周最高分 */
    private weekHighestScore: number = Consts.Constant.Week;
    /**当月最高分 */
    private monthHighestScore: number = Consts.Constant.Month;
    /**历史最高分 */
    private historyHighestScore: number = Consts.Constant.History;
    /**分数缓存 */
    private scoreCache: { day: number, week: number, month: number, history: number } = null;
    /**
     * 当前分数 s当前分数, h 历史分数
     */
    private dateScoreList: { s: number, h: number }[][] = [];
    /**当天破纪录记录 */
    private currentRecord: number[] = [0, 0, 0, 0];
    /**事件分数 */
    private eventScoreList: { [key: string]: { s: number, h: number } }[] = [];

    /**当前分数*/
    private currentScore: number = 0;
    /**天分数 */
    private dailyScore: number = 0;
    /**事件分数 */
    // private eventScore: number = 0;

    /**是否有改动 */
    private isChange: boolean = false;
    /**破记录list */
    private recordList: string[] = [];

    constructor() {
        this.Init();
    }

    private Init() {
        // let scoreList = [500, 600, 700, 800];
        this.ReadData();
        if (this.dateScoreList.length == 0) {
            for (let i = 0; i < 31; i++) {
                this.dateScoreList[i] = [];
                for (let j = 0; j < Consts.Constant.MaxKeepMonthCount; j++) {
                    // let index = Utility.RandomRangeInt(0, scoreList.length - 1);
                    this.dateScoreList[i].push({ s: 0, h: 0 });
                }
            }
            this.isChange = true;
            this.WriteData();
        }


        // //测试代码
        // for (let i = 0; i < 28; i++) {
        //     if (i > 0) {
        //         cc.log(i);
        //         this.dateScoreList[i][3].h = 1000
        //     } else {
        //         this.dateScoreList[i][3] = { s: 0, h: 0 };
        //     }
        // }
        // //end

        if (this.eventScoreList.length == 0) {
            let arr = Game.Instance.EventDataConfig.GetAllConfig();
            for (let i = 0; i < arr.length; i++) {
                let list = arr[i];
                this.eventScoreList[i] = {};
                let index = 0;
                for (let key of list) {
                    index++;
                    this.eventScoreList[i][key] = { s: 0, h: 0 };
                    // if (index + 1 == list.length) {
                    //     this.eventScoreList[i][key] = { s: 0, h: 0 };
                    // }
                }

            }
        }

    }

    /**更新分数*/
    public AddNormalScore(score: number) {
        this.recordList = [];
        this.currentScore += score;
        if (this.currentScore > this.dayHighestScore) {
            this.dayHighestScore = this.currentScore;
            if (this.currentRecord[0] == 0) {
                this.recordList.push(Consts.Event.EDayRecord);
                this.currentRecord[0] = 1;
            }
        }
        if (this.currentScore > this.weekHighestScore) {
            this.weekHighestScore = this.currentScore;
            if (this.currentRecord[1] == 0) {
                this.recordList.push(Consts.Event.EWeekRecord);
                this.currentRecord[1] = 1;
            }
        }

        if (this.currentScore > this.monthHighestScore) {
            this.monthHighestScore = this.currentScore;
            if (this.currentRecord[2] == 0) {
                this.recordList.push(Consts.Event.EMonthRecord);
                this.currentRecord[2] = 1;
            }
        }

        if (this.currentScore > this.historyHighestScore) {
            this.historyHighestScore = this.currentScore;
            if (this.currentRecord[3] == 0) {
                this.recordList.push(Consts.Event.EHistoryRecord);
                this.currentRecord[3] = 1;
            }
            // /**上报分数 */
            // Game.Instance.Net.UpdateScore(this.History);
        }
        this.isChange = true;
    }

    /**获取破记录表 */
    public RecordList() {
        return this.recordList;
    }

    /**添加每日分数 */
    public AddDailyScore(month: number, day: number, score: number) {
        this.dateScoreList[day][month].s += score;
        this.dailyScore = this.dateScoreList[day][month].s;
        this.isChange = true
    }
    /**更新每日挑战历史积分 */
    public UpdateDailyHistoryScore(month: number, day: number, score: number) {
        this.dateScoreList[day][month].h = score;
        this.dateScoreList[day][month].s = score;
        this.isChange = true;
    }

    public AddEventScore(index: number, name: string, score: number) {
        this.eventScoreList[index][name].s += score;
        this.isChange = true;
    }

    public UpdateEventHistoryScore(index: number, name: string, score: number) {
        this.eventScoreList[index][name].s = score;
        this.eventScoreList[index][name].h = score;
        this.isChange = true;
    }

    /**获取每日数据 */
    public GetDailyData(month: number, day: number) {
        return this.dateScoreList[day][month];
    }

    /**获取挑战数据 */
    public GetEventData(index: number, name: string) {
        return this.eventScoreList[index][name]
    }

    /**获取事件分数列表 */
    public GetEventScoreList() {
        return this.eventScoreList;
    }

    /**月份不相同了 更新当前月的数据 */
    public UpdateDayScore() {
        for (let i = 0; i < this.dateScoreList.length; i++) {
            let temp = this.dateScoreList[i];
            temp.pop();
            this.dateScoreList[i] = [{ s: 0, h: 0 }].concat(temp);
        }
        this.isChange = true;
    }

    /**当前分数 */
    public get Score() {
        return this.currentScore;
    }

    /**重置每日分数 */
    public RestDaily() {
        this.isChange = true;
        this.dayHighestScore = Consts.Constant.Day;
        this.UpdateScoreCache();
        this.currentRecord = [0, 0, 0, 0];
    }

    /**重置每周分数 */
    public ResetWeek() {
        this.isChange = true;
        this.weekHighestScore = Consts.Constant.Week;
        this.UpdateScoreCache();
    }

    /**刷新月分数 */
    public ResetMonth() {
        this.isChange = true;
        this.monthHighestScore = Consts.Constant.Month;
        this.UpdateScoreCache();
    }



    /**当天 */
    public get Day() {
        return this.dayHighestScore;
    }

    /**当月 */
    public get Month() {
        return this.monthHighestScore
    }

    public get Week() {
        return this.weekHighestScore;
    }

    /**历史 */
    public get History() {
        return this.historyHighestScore;
    }

    public set History(value: number) {
        this.historyHighestScore = value;
        this.isChange = true;
    }


    /**是否破记录 */
    public IsRecord() {
        let cache = this.scoreCache;
        return this.currentScore > cache.day ||
            this.currentScore > cache.week ||
            this.currentScore > cache.month ||
            this.currentScore > cache.history;
    }

    /**获取最低分 */
    public GetLowestScore() {
        let value: { score: number, title: string } = null;
        let arr = [this.dayHighestScore, this.weekHighestScore, this.monthHighestScore, this.historyHighestScore];

        for (let i = 0; i < arr.length; i++) {
            if (this.currentRecord[i] == 1) {
                continue;
            }

            if (value == null) {
                if (arr[i] >= this.currentScore) {
                    cc.log(this.currentScore, arr[i])
                    value = { score: arr[i], title: Consts.RecordTips[i] };
                }
            } else {
                if (value.score == arr[i]) {
                    value = { score: arr[i], title: Consts.RecordTips[i] };
                }
            }
        }
        return value
    }


    /**刷新普通分数*/
    public UpdateNormalScore() {
        this.UpdateScoreCache();
        this.currentScore = 0;
        this.isChange = true;
    }

    /**清理当前积分 */
    public ClearNormalScore() {
        this.currentScore = 0;
        this.UpdateScoreCache();
        this.currentRecord = [0, 0, 0, 0];
        this.isChange = true;
        this.WriteData();
    }

    /**大于钱一个历史分 */
    public GetPreviousHistory() {
        return this.scoreCache.history;
    }


    /**清除天数据 */
    public ClearDailyScore(m: number, day: number) {
        this.GetDailyData(m, day).s = 0;
        this.isChange = true;
        this.WriteData();
    }

    /**清理挑战事件 */
    public ClearEventScore(index: number, name: string) {
        this.eventScoreList[index][name].s = 0;
        this.isChange = true;
        this.WriteData();
    }

    private ReadData() {
        let obj = cc.sys.localStorage.getItem(this.ItemKey);
        if (obj) {
            let data = JSON.parse(obj);
            this.currentScore = data.score || 0;
            this.historyHighestScore = data.history || 0;
            this.dayHighestScore = data.day || 0;
            this.monthHighestScore = data.month || 0;
            this.weekHighestScore = data.week || 0;
            this.dateScoreList = data.date || this.dateScoreList;
            this.scoreCache = data.cache;
            this.currentRecord = data.record || this.currentRecord;
            this.eventScoreList = data.event || this.eventScoreList;
        }

        if (this.scoreCache == null) {
            this.UpdateScoreCache();
            this.isChange = true;;
            this.WriteData();
        }
    }

    /**更新分数缓存 */
    private UpdateScoreCache() {
        this.scoreCache = {
            day: this.dayHighestScore,
            week: this.weekHighestScore,
            month: this.monthHighestScore,
            history: this.historyHighestScore,
        }
    }


    /**获取分数缓存 */
    public GetScoreCache() {
        return this.scoreCache;
    }

    /**写入数据*/
    public WriteData() {
        if (this.isChange) {
            let data = {
                score: this.currentScore,
                day: this.dayHighestScore,
                week: this.weekHighestScore,
                month: this.monthHighestScore,
                history: this.historyHighestScore,
                date: this.dateScoreList,
                cache: this.scoreCache,
                record: this.currentRecord,
                event: this.eventScoreList,
            }
            let obj = JSON.stringify(data);
            cc.sys.localStorage.setItem(this.ItemKey, obj);
        }
        this.isChange = false;
    }

    public ClearEventList() {
        let arr = Game.Instance.EventDataConfig.GetAllConfig();
        for (let i = 0; i < arr.length; i++) {
            let list = arr[i];
            this.eventScoreList[i] = {};
            for (let key of list) {
                this.eventScoreList[i][key] = { s: 0, h: 0 };
            }
        }
        this.isChange = true;
    }

    private get ItemKey() {
        return Consts.GameName + "_GameScore";
    }
}