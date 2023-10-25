import Consts from "../Consts/Consts";

/**仓库 */
export default class GameWarehouse {
    /**普通模式仓库 */
    private normalWarehouse: { index: number, blockType: number, isPlace: boolean, tileColor: number[] }[] = [];
    /**事件模式仓库 */
    private eventWarehouse: { index: number, blockType: number, isPlace: boolean, tileColor: number[] }[] = [];
    /**每日挑战仓库 */
    private dailyWarehouse: { index: number, blockType: number, isPlace: boolean, tileColor: number[] }[] = [];

    private isChange: boolean = false;

    constructor() {
        this.Init();
    }

    private Init() {
        this.ReadData();
    }

    private ReadData() {
        let data = cc.sys.localStorage.getItem(this.KeyItem);
        if (data) {
            let json = JSON.parse(data);
            this.normalWarehouse = json.nWarehouse || this.normalWarehouse;
            this.eventWarehouse = json.eWarehouse || this.eventWarehouse;
            this.dailyWarehouse = json.dWarehouse || this.dailyWarehouse;
        }
    }

    public WriteData() {
        if (this.isChange) {
            let data = {
                nWarehouse: this.normalWarehouse,
                eWarehouse: this.eventWarehouse,
                dWarehouse: this.dailyWarehouse,
            }
            cc.sys.localStorage.setItem(this.KeyItem, JSON.stringify(data));
        }
    }

    public get NormalWarehouse() {
        return this.normalWarehouse;
    }

    public get EventWarehouse() {
        return this.eventWarehouse;
    }

    public get DailyWarehouse() {
        return this.dailyWarehouse;
    }


    public PushNormal(value: { index: number, blockType: number, isPlace: boolean, tileColor: number[] }) {
        this.normalWarehouse.push(value);
        this.isChange = true;
    }
    public PushEvent(value: { index: number, blockType: number, isPlace: boolean, tileColor: number[] }) {
        this.eventWarehouse.push(value);
        this.isChange = true;
    }

    public PushDaily(value: { index: number, blockType: number, isPlace: boolean, tileColor: number[] }) {
        this.dailyWarehouse.push(value);
        this.isChange = true;
    }


    public PopNormal() {
        this.normalWarehouse.pop()
        this.isChange = true;
    }
    public PopEvent() {
        this.eventWarehouse.pop();
        this.isChange = true;
    }

    public PopDaily() {
        this.dailyWarehouse.pop();
        this.isChange = true;
    }



    private get KeyItem() {
        return Consts.GameName + "_Warehouse";
    }

}