import Consts from "../Consts/Consts";
import Game from "../Game";

export class eventSelectBlockItem {
    blockType: number;
    isPlace: boolean;
    tileColor: number[]
}

export default class GameSelectBlock {
    /**普通模式 */
    private normalblock: { blockType: number, isWarehouse: boolean, isPlace: boolean, tileColor: number[] }[] = [];
    /**每日挑战的 */
    private dailyblock: { blockType: number, isWarehouse: boolean, isPlace: boolean, tileColor: number[] }[][][] = [];
    /**事件模式的 */
    private eventblock: { [key: string]: { blockType: number, isWarehouse: boolean, isPlace: boolean, tileColor: number[] }[] }[] = [];

    private isChange: boolean = false;

    constructor() {
        this.Init();
    }

    Init() {
        this.ReadData();
    }

    private ReadData() {
        let obj = cc.sys.localStorage.getItem(this.KeyItem);
        if (obj) {
            let json = JSON.parse(obj);
            this.normalblock = json.nb || this.normalblock;
            this.dailyblock = json.daily || this.dailyblock;
            this.eventblock = json.event || this.eventblock;
        }

        /**每日挑战*/
        if (this.dailyblock.length == 0) {
            for (let i = 0; i < 31; i++) {
                this.dailyblock[i] = [];
                for (let j = 0; j < 4; j++) {
                    this.dailyblock[i][j] = [];
                }
            }
        }

        if (this.eventblock.length == 0) {
            let arr = Game.Instance.EventDataConfig.GetAllConfig();
            for (let i = 0; i < arr.length; i++) {
                let list = arr[i];
                this.eventblock[i] = {};
                for (let key of list) {
                    this.eventblock[i][key] = [];
                }
            }
        }
    }

    public WriteData() {
        if (this.isChange) {
            let data = {
                nb: this.normalblock,
                daily: this.dailyblock,
                event: this.eventblock,
            }
            cc.sys.localStorage.setItem(this.KeyItem, JSON.stringify(data));
        }
        this.isChange = false;
    }

    /**刷新月*/
    public UpdateMonth() {
        for (let i = 0; i < this.dailyblock.length; i++) {
            let temp = this.dailyblock[i];
            temp.pop();
            this.dailyblock[i] = [].concat(temp);
        }
    }

    /**刷新普通选择 */
    public UpdateNormalSelect(b: { blockType: number, isPlace: boolean, isWarehouse: boolean,tileColor: number[] }[]) {
        this.isChange = true;
        this.normalblock = b;
        this.WriteData();
    }

    /**刷新每日挑战选择 */
    public UpdateDailyBlockSelect(index: number, day: number, b: { blockType: number, isPlace: boolean,isWarehouse: boolean, tileColor: number[] }[]) {
        this.isChange = true;
        this.dailyblock[day][index] = b;
        this.WriteData();
    }

    /**刷新事件选择 */
    public UpdateEventBlockSelect(index: number, name: string, b: { blockType: number, isPlace: boolean,isWarehouse: boolean, tileColor: number[] }[]) {
        let data = this.eventblock[index];
        data[name] = b;
        this.isChange = true;
        this.WriteData();
    }

    /**清理普通block选择 */
    public ClearNormalBlockList() {
        this.isChange = true;
        this.normalblock = [];
        this.WriteData();
    }

    public ClearDailyBlockList(index: number, day: number) {
        this.isChange = true;
        this.dailyblock[day][index] = [];
        this.WriteData();
    }

    public ClearEventBlockList(index: number, name: string) {
        let data = this.eventblock[index];
        data[name] = [];
        this.isChange = true;
        this.WriteData();
    }

    public NormalBlockList() {
        return this.normalblock;
    }

    public DailyBlockList(index: number, day: number) {
        return this.dailyblock[day][index];
    }

    public EventBlockList(index: number, name: string) {
        let data = this.eventblock[index];
        return data[name];
    }

    private get KeyItem() {
        return Consts.GameName + "_SelectBlock";
    }

    public ClearEventList() {
        let arr = Game.Instance.EventDataConfig.GetAllConfig();
        for (let i = 0; i < arr.length; i++) {
            let list = arr[i];
            this.eventblock[i] = {};
            for (let key of list) {
                this.eventblock[i][key] = [];
            }
        }
        this.isChange = true;
    }
}