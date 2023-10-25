import Utility from "../Utility";

export class BaseConfig {
    public ParseData(data: any) {

    }
}


export class MapConfig extends BaseConfig {
    private mapList: number[][] = [];

    public ParseData(data: any) {
        let matrix = data.matrix;
        let keys = Object.keys(matrix);
        for (let i = 0; i < keys.length; i++) {
            this.mapList.push(matrix[keys[i]]);
        }
    }

    public GetAllMap() {
        return this.mapList;
    }
}

export class BlockConfig extends BaseConfig {
    private blockList: number[][] = [];

    public ParseData(data: any) {
        let matrix = data.matrix;
        let keys = Object.keys(matrix);
        for (let i = 0; i < keys.length; i++) {
            this.blockList.push(matrix[keys[i]]);
        }
    }

    public GetAllBlock() {
        return this.blockList;
    }
}

export class TerrainConfig extends BaseConfig {
    private terrainList: number[][] = [];

    public ParseData(data: any) {
        let matrix = data.matrix;
        let keys = Object.keys(matrix);
        for (let i = 0; i < keys.length; i++) {
            this.terrainList.push(matrix[keys[i]]);
        }
    }

    public GetTerrain() {
        return this.terrainList;
    }
}

export class TileConfigItem {
    Id: number;
    Type: number;
    Count: number;
    Name: string;
    Color: string;
}

export class TileConfig extends BaseConfig {
    private tileList: TileConfigItem[] = [];
    private normalTileList: TileConfigItem[] = [];
    private tileMap: Map<string, TileConfigItem> = new Map<string, TileConfigItem>();

    public ParseData(data: any) {
        let keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            let tileData = data[keys[i]];
            let item = new TileConfigItem();
            item.Id = tileData.Id;
            item.Type = tileData.Type;
            item.Count = tileData.Count;
            item.Name = tileData.Name;
            item.Color = tileData.Color;
            this.tileList.push(item);
            if (item.Id > 9 && item.Id < 13) {
                this.normalTileList.push(item);
            }
            this.tileMap.set(item.Id.toString(), item);
        }
    }

    public GetAllTile(): Readonly<TileConfigItem[]> {
        return this.tileList;
    }

    /**普通的tile 只能消除一次的 */
    public GetNormalTileList(): Readonly<TileConfigItem[]> {
        return this.normalTileList;
    }

    public GetNormalTileListLength() {
        return this.normalTileList.length;
    }

    public GetTileToId(Id: number): Readonly<TileConfigItem> {
        return this.tileMap.get(Id.toString());
    }
}

export class DailyConfigItem {
    /**地图 */
    public mIndex: number = 0;
    /**地块 */
    public tIndex: number = 0;
    /**分数 */
    public score: number = 0;
    /**类型消除数 */
    public typeCount: { [key: number]: number } = null;
}

export class DailyDataConfig extends BaseConfig {
    private dailyConfigList: DailyConfigItem[][] = [];
    public ParseData(data: any): void {
        let keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            let arrList = data[keys[i]];
            this.dailyConfigList[i] = [];
            for (let j = 0; j < arrList.length; j++) {
                let conf = arrList[j];
                let item = new DailyConfigItem();
                item.mIndex = conf.MapIndex;
                item.tIndex = conf.TerIndex;
                item.score = conf.Score;
                item.typeCount = conf.TypeCount
                this.dailyConfigList[i].push(item);
            }
        }
    }

    public GetMonthDailyConf(month: number) {
        return this.dailyConfigList[month - 1];
    }

    public GetDailyConf(month: number, day: number) {
        return this.dailyConfigList[month - 1][day];
    }

    public GetTypeCount(month: number, day: number, type: number) {
        let item = this.GetDailyConf(month, day);
        return item.typeCount[type]
    }

    public GetScore(month: number, day: number) {
        let conf = this.GetDailyConf(month, day);
        if (conf == null) {
            return 0xfffff;
        }
        return this.GetDailyConf(month, day).score;
    }
}

export class DifficultyItem {
    public Id: number;
    /**失败次数 */
    public FaildNum: number;
    public Type: number[];
}

export class DifficultyConfig extends BaseConfig {
    private difficultyList: DifficultyItem[] = [];
    public ParseData(data: any): void {
        let keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            let conf = data[keys[i]];
            let item = new DifficultyItem();
            item.Id = conf.Id;
            item.FaildNum = conf.FaildNum;
            item.Type = conf.Type;
            this.difficultyList.push(item);
        }
    }

    public GetConf() {
        return this.difficultyList;
    }
}
export class BlockTypeItem {
    public Id: number;
    public Type: number;
}

export class BlockTypeConfing extends BaseConfig {
    private blockDict: Map<number, BlockTypeItem[]> = new Map<number, BlockTypeItem[]>();
    public ParseData(data: any): void {
        let keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            let conf = data[keys[i]];
            let item = new BlockTypeItem();
            item.Id = conf.Id;
            item.Type = conf.Type;

            if (!this.blockDict.has(conf.Type)) {
                this.blockDict.set(conf.Type, []);
            }
            this.blockDict.get(conf.Type).push(item);
        }
    }

    public GetBlockTypeList(type: number) {
        return this.blockDict.get(type);
    }
}

export class EventDataItem {
    /**地图 */
    public mIndex: number = 0;
    /**地块 */
    public tIndex: number = 0;
    /**分数 */
    public score: number = 0;
    /**类型消除数 */
    public typeCount: { [key: number]: number } = null;
}

export class EventDataConfig extends BaseConfig {
    private confList: Map<string, EventDataItem>[] = [];
    private keyList: string[][] = [];

    public ParseData(data: any): void {
        let keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            let confList = data[keys[i]];
            this.confList[i] = new Map<string, EventDataItem>();
            this.keyList[i] = [];
            for (let j = 0; j < confList.length; j++) {
                let conf = confList[j];
                let item = new EventDataItem();
                item.mIndex = conf.MapIndex;
                item.tIndex = conf.TerIndex;
                item.score = conf.Score;
                item.mIndex = conf.MapIndex;
                item.typeCount = conf.TypeCount;
                let name = conf.Name;
                this.confList[i].set(name, item);
                this.keyList[i].push(name);
            }
        }
    }

    public GetEventConf(index: number, name: string) {
        return this.confList[index].get(name);
    }

    public GetAllConfig() {
        return this.keyList;
    }
}

export class EventTimeData {
    Id: number;
    Type: number;
    Name: string;
    Icon: string;
    Start: number;
    End: number;
    Image1: string;
    Image2: string;
    Image3: string;
}

export class EventTimeConfig extends BaseConfig {
    private eventList: EventTimeData[] = [];
    private openEvent: EventTimeData = null;
    private dataMap: Map<string, EventTimeData> = new Map<string, EventTimeData>();

    public ParseData(data: any): void {
        let keys = Object.keys(data);
        for (let k of keys) {

            let conf = data[k]
            let e = new EventTimeData();
            e.Id = conf.Id;
            e.Type = conf.Type;
            e.Name = conf.Name;
            e.Icon = conf.Icon;
            e.Start = conf.Start;
            e.End = conf.End;
            e.Image1 = conf.Image1;
            e.Image2 = conf.Image2;
            e.Image3 = conf.Image3;
            if (conf.Isopen == 1) {
                let current = Utility.TimeStamp();
                if (conf.End - current > 0) {
                    this.openEvent = e;
                }
            }
            this.eventList.push(e);
            this.dataMap.set(k, e);
        }
    }

    public GetAllEventList() {
        return this.eventList;
    }

    public OpenEvent() {
        return this.openEvent;
    }

    public GetIdConf(id: string) {
        return this.dataMap.get(id);
    }
}


export class DailyChallengesConfigItem {
    Id: number;
    Time: number;
    Image: string;
}

export class DailyChallengesConfig extends BaseConfig {
    private configList: DailyChallengesConfigItem[] = [];
    public ParseData(data: any): void {
        let keys = Object.keys(data);
        for (let k of keys) {
            let conf = data[k];
            let item = new DailyChallengesConfigItem();
            item.Id = conf.Id;
            item.Time = conf.Time;
            item.Image = conf.Image;
            this.configList.push(item);
        }
    }

    public GetConfList(index: number) {
        return this.configList[index];
    }
}