import Consts from "../Consts/Consts";
import { GameEventMgr } from "../Framework/GameEvent";

export default class GameReward {
    /**奖杯数组 */
    private cupList: number[] = [];
    /**图片list */
    private textureList: { [key: string]: { count: number, year: string[] } } = {};

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
            this.cupList = json.cup || this.cupList;
            this.textureList = json.texture || this.textureList;
        }
    }


    public WriteData() {
        if (this.isChange) {
            let data = {
                cup: this.cupList,
                texture: this.textureList,
            }
            cc.sys.localStorage.setItem(this.KeyItem, JSON.stringify(data));
        }
        this.isChange = false;
    }

    public GetCupList() {
        return this.cupList;
    }

    public GetTextureList(id: string) {
        return this.textureList[id];
    }

    public GetTexture() {
        return this.textureList;
    }

    public PushCupList(month: number) {
        this.cupList.push(month);
        this.isChange = true;
    }

    /**这个月拿到奖杯没有*/
    public CupContain(month: number) {
        return this.cupList.indexOf(month) == -1
    }

    public AddTextureList(id: number, year: string) {
        if (this.textureList[id.toString()] == null) {
            this.textureList[id.toString()] = { count: 0, year: [] };
        }
        this.textureList[id.toString()].count++;
        this.textureList[id.toString()].year.push(year);
        if (this.textureList[id.toString()].count >= 3) {
            GameEventMgr.Instance.EmitEvent(Consts.Event.EEventComplete, id.toString());
        }
        this.isChange = true;
    }



    private get KeyItem() {
        return Consts.GameName + "_GameReward";
    }
}