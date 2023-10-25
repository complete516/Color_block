import Consts from "../Consts/Consts";

/**新手引导 */
export default class GameGuide {
    private dailyGuide: number = 0;
    /**普通步骤*/
    private normalGuide: number = 0;
    private isChange: boolean = false;

    private inices: { x: number, y: number }[] = [{ x: 4, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 2 }];

    constructor() {
        this.Init();
    }

    public Init() {
        this.ReadData();
    }

    public ReadData() {
        let obj = cc.sys.localStorage.getItem(this.KeyItem);
        if (obj) {
            let json = JSON.parse(obj);
            this.dailyGuide = json.daily;
            this.normalGuide = json.normal;
        }
    }

    public get DailyGuideStep() {
        return this.dailyGuide;
    }

    public set DailyGuideStep(value: number) {
        this.dailyGuide = value;
        this.isChange = true;
    }

    /**普通引导*/
    public get NormalGuideStep() {
        return this.normalGuide;
    }

    public set NormalGuideStep(value: number) {
        this.normalGuide = value;
        this.isChange = true;
    }

    public NormalInices() {
        return this.inices[this.normalGuide];
    }

    public WriteData() {
        if (!this.isChange) {
            return;
        }

        let data = {
            daily: this.dailyGuide,
            normal: this.normalGuide,
        }
        cc.sys.localStorage.setItem(this.KeyItem, JSON.stringify(data));
    }

    public GetBlockList() {
        let tileColorList = [0, 1, 1, 0];
        let blockTypeList = [0, 0, 0, 8];
        let arr: { blockType: number, isPlace: boolean, isWarehouse: false, tileColor: number[] }[] = [];
        let tcList: number[] = [];
        for (let i = 0; i < 4; i++) {
            tcList.push(tileColorList[this.NormalGuideStep]);
        }

        arr.push({ blockType: blockTypeList[this.NormalGuideStep], isPlace: false, isWarehouse: false, tileColor: tcList });
        return arr;
    }

    private get KeyItem() {
        return Consts.GameName + "_GameGuide";
    }
}