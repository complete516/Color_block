import Consts from "../Consts/Consts";
import { GameEventMgr } from "../Framework/GameEvent";
import ResMgr from "../Framework/ResMgr";
import Game from "../Game";
import { DailyDataConfig, BaseConfig, BlockConfig, MapConfig, TerrainConfig, TileConfig, DifficultyConfig, BlockTypeConfing, EventDataConfig, EventTimeConfig, DailyChallengesConfig } from "./ConfigData";

export default class ConfigMgr {
    private dict: Map<string, BaseConfig> = new Map<string, BaseConfig>();

    constructor() {
        this.Init();
    }

    public Init() {
        this.ParseConfig("MapConfig", () => { return new MapConfig() });
        this.ParseConfig("BlockConfig", () => { return new BlockConfig(); });
        this.ParseConfig("TileConfig", () => { return new TileConfig(); });
        this.ParseConfig("TerrainConfig", () => { return new TerrainConfig() });
        this.ParseConfig(Consts.ResName.DailyDataConfig, () => { return new DailyDataConfig() });
        this.ParseConfig(Consts.ResName.DifficultyConfig, () => { return new DifficultyConfig() });
        this.ParseConfig(Consts.ResName.BlockTypeConfing, () => { return new BlockTypeConfing() });
        this.ParseConfig(Consts.ResName.EventDataConfig, () => { return new EventDataConfig() });
        this.ParseConfig(Consts.ResName.EventTimeConfig, () => { return new EventTimeConfig() });
        this.ParseConfig(Consts.ResName.DailyChallengesConfig, () => { return new DailyChallengesConfig() });

        // cc.assetManager.loadRemote("https://h5xiaoyouxi.oss-cn-beijing.aliyuncs.com/html5/colormatch/EventTime.json", (err, ass: cc.JsonAsset) => {
        //     if (err) {
        //         return;
        //     }
        //     let json = ass.json;
        //     let conf = new EventTimeConfig();
        //     conf.ParseData(json);
        //     this.dict.set(Consts.ResName.EventTimeConfig, conf);
        //     GameEventMgr.Instance.EmitEvent(Consts.Event.EResetCheckEvent);
        // });

        // cc.assetManager.loadRemote(Consts.URL + "DailyChallenges.json", (err, ass: cc.JsonAsset) => {
        //     if (err) {
        //         return;
        //     }

        //     let json = ass.json;
        //     let conf = new DailyChallengesConfig();
        //     conf.ParseData(json);
        //     this.dict.set("DailyChallengesConfig", conf);
        // });

        // cc.assetManager.loadRemote(Consts.URL + "EventDataConfig.json", (err, ass: cc.JsonAsset) => {
        //     if (err) {
        //         return;
        //     }
        //     let json = ass.json;
        //     let conf = new EventDataConfig();
        //     conf.ParseData(json);
        //     this.dict.set(Consts.ResName.EventDataConfig, conf);
        // });
    }

    private ParseConfig(jsonName: string, create: Function) {
        let json = ResMgr.Instance.GetConfig(jsonName);
        if (create) {
            let conf = create();
            conf.ParseData(json);
            this.dict.set(jsonName, conf);
        }
    }


    public GetConf<T extends BaseConfig>(jsonName: string): T {
        let conf = this.dict.get(jsonName);
        return conf as T;
    }
}