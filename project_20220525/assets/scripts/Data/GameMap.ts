import Consts from "../Consts/Consts";
import Game from "../Game";
import Utility from "../Utility";

/**游戏光卡 */
export default class GameMap {
    /**普通模式地图 */
    private normalMap: number[] = [];
    /**每日挑战 */
    private dailyMap: { matrix: number[], count: number[], failed: number, start: number }[][] = [];
    /**事件地图 */
    private eventMap: { [key: string]: { matrix: number[], count: number[], failed: number, start: number } }[] = [];

    private isChange: boolean = false;

    constructor() {
        this.Init();
    }

    private Init() {
        this.ReadData();
    }

    private ReadData() {
        let obj = cc.sys.localStorage.getItem(this.KeyItem);
        if (obj) {
            let json = JSON.parse(obj);
            this.normalMap = json.normal || this.normalMap;
            this.dailyMap = json.daily || this.dailyMap;
            this.eventMap = json.event || this.eventMap;
        }

        if (this.dailyMap.length == 0) {
            for (let i = 0; i < 31; i++) {
                this.dailyMap[i] = [];
                for (let ix = 0; ix < 4; ix++) {
                    this.dailyMap[i][ix] = { matrix: [], count: [], failed: 0, start: 0 };
                }
            }
        }

        if (this.eventMap.length == 0) {
            let arr = Game.Instance.EventDataConfig.GetAllConfig();
            for (let i = 0; i < arr.length; i++) {
                let list = arr[i];
                this.eventMap[i] = {};
                for (let key of list) {
                    this.eventMap[i][key] = { matrix: [], count: [], failed: 0, start: 0 };
                }
            }
        }
    }

    /**更新月地图 */
    public UpdateMonthMap() {
        for (let i = 0; i < this.dailyMap.length; i++) {
            let temp = this.dailyMap[i]
            temp.pop();
            this.dailyMap[i] = [{ matrix: [], count: [], failed: 0, start: 0 }].concat(temp);
        }
    }



    public GetDailyFailedNum(month: number, day: number) {
        return this.dailyMap[day][month].failed;
    }

    /**添加每日挑战失败 */
    public AddDailyFailedNum(month: number, day: number) {
        this.dailyMap[day][month].failed++;
        this.isChange = true;
    }

    public AddEventFailedNum(index: number, eventName: string) {
        this.eventMap[index][eventName].failed++;
        this.isChange = true;
    }

    public GetEventFailedNum(index: number, eventName: string) {
        return this.eventMap[index][eventName].failed;
    }


    public WriteData() {
        if (this.isChange) {
            let data = {
                normal: this.normalMap,
                daily: this.dailyMap,
                event: this.eventMap,
            }
            cc.sys.localStorage.setItem(this.KeyItem, JSON.stringify(data));
        }
        this.isChange = false;
    }


    public UpdateNormalMap(matrix: number[]) {
        for (let i = 0; i < matrix.length; i++) {
            let xIndex = i % 9;
            let yIndex = Math.floor(i / 9);
            let ix = xIndex + (8 - yIndex) * 9;
            this.normalMap[ix] = matrix[i];
        }
        this.isChange = true;
    }

    public UpdateDailyMap(m: number, day: number, matrix: number[], countList: number[]) {
        let data = this.dailyMap[day][m];
        for (let i = 0; i < matrix.length; i++) {
            let xIndex = i % 9;
            let yIndex = Math.floor(i / 9);
            let ix = xIndex + (8 - yIndex) * 9;
            data.matrix[ix] = matrix[i];
            data.count[ix] = countList[i];
        }
        this.isChange = true;
    }

    /**设置每日挑战开始时间 */
    public SetDailyStartTime(m: number, day: number) {
        this.dailyMap[day][m].start = Utility.TimeStamp();
        this.isChange = true;
    }

    public SetEventStartTime(index: number, eventName: string) {
        this.eventMap[index][eventName].start = Utility.TimeStamp();
        this.isChange = true;
    }

    public GetEventStartTime(index: number, eventName: string) {
        return this.eventMap[index][eventName].start
    }

    public GetDailyStartTime(m: number, day: number) {
        return this.dailyMap[day][m].start;
    }

    public ClearNormalMap() {
        this.normalMap = [];
        this.isChange = true;
        this.WriteData();
    }

    public ClearDailyMap(m: number, day: number) {
        this.dailyMap[day][m].matrix = [];
        this.dailyMap[day][m].count = [];
        this.dailyMap[day][m].start = 0;
        this.isChange = true;
        this.WriteData();
    }

    public NormalMap() {
        return this.normalMap;
    }

    public DailyTileCount(index: number, day: number) {
        return this.dailyMap[day][index].count;
    }

    public DailyMap(index: number, day: number) {
        return this.dailyMap[day][index].matrix;
    }

    public EventTileCount(index: number, name: string) {
        let data = this.eventMap[index];
        return data[name].count;
    }
    /**事件地图 */
    public UpdateEventMap(index: number, key: string, matrix: number[], countList: number[]) {
        let data = this.eventMap[index][key];
        for (let i = 0; i < matrix.length; i++) {
            let xIndex = i % 9;
            let yIndex = Math.floor(i / 9);
            let ix = xIndex + (8 - yIndex) * 9;
            data.matrix[ix] = matrix[i];
            data.count[ix] = countList[i];
        }
        this.isChange = true;
    }

    /**事件地图 */
    public EventMap(index: number, key: string) {
        let data = this.eventMap[index];
        return data[key].matrix;
    }

    public ClearEventMap(index: number, key: string) {
        let data = this.eventMap[index];
        data[key].matrix = [];
        data[key].count = [];
        data[key].start = 0;
        this.isChange = true;
    }

    public GetEventList() {
        return this.eventMap;
    }

    public ClearEventList() {
        let arr = Game.Instance.EventDataConfig.GetAllConfig();
        for (let i = 0; i < arr.length; i++) {
            let list = arr[i];
            this.eventMap[i] = {};
            for (let key of list) {
                this.eventMap[i][key] = { matrix: [], count: [], failed: 0, start: 0 };
            }
        }
        this.isChange = true;
    }

    private get KeyItem() {
        return Consts.GameName + "_GameMap";
    }
}