import { DailyDataConfig, BlockConfig, MapConfig, TerrainConfig, TileConfig, DifficultyConfig, BlockTypeConfing, EventDataConfig, EventTimeConfig, DailyChallengesConfig } from "./Config/ConfigData";
import ConfigMgr from "./Config/ConfigMgr";
import Consts from "./Consts/Consts";
import { GameState, GameType } from "./Consts/Define";
import GameCache from "./Data/GameCache";
import GameData from "./Data/GameData";
import GameDate from "./Data/GameDate";
import GameGuide from "./Data/GameGuide";
import GameMap from "./Data/GameMap";
import GameReward from "./Data/GameReward";
import GameScore from "./Data/GameScore";
import GameSelectBlock from "./Data/GameSelectBlock";
import GameWarehouse from "./Data/GameWarehouse";
import AudioMgr from "./Framework/AudioMgr";
import { GameEventMgr } from "./Framework/GameEvent";
import NetRequest from "./Net/NetRequest";

import ColorNodePool from "./ObjectPool/ColorNodePool";
import EffectPool from "./ObjectPool/EffectPool";
import SDKMgr from "./SDK/SDKMgr";
import Utility from "./Utility";

const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    private static instance: Game = null;
    private config: ConfigMgr = null;
    private date: GameDate = null;
    private score: GameScore = null;
    private cache: GameCache = null;
    private map: GameMap = null;
    private select: GameSelectBlock = null;
    private effectPool: EffectPool = null;
    private colorPool: ColorNodePool = null;
    private gameGuide: GameGuide = null;
    private reward: GameReward = null;
    private data: GameData = null;
    private guideTerrain: number = 83;
    /**块的颜色，五局游戏给的颜色*/
    private tileColorList: number[] = [];
    // @property(NetRequest)
    // @requireComponent(NetRequest)
    private netRequest: NetRequest = null;
    private isFirst: boolean = true;

    // private warehouse: GameWarehouse = null;

    public static get Instance() {
        return this.instance;
    }

    protected onLoad(): void {
        Game.instance = this;
        this.config = new ConfigMgr();;
        this.date = new GameDate();
        this.score = new GameScore();
        this.cache = new GameCache();
        this.map = new GameMap();
        this.select = new GameSelectBlock();
        this.effectPool = new EffectPool();
        this.colorPool = new ColorNodePool();
        this.gameGuide = new GameGuide();
        this.reward = new GameReward();
        this.data = new GameData();
        // this.warehouse = new GameWarehouse();

        if (this.date.IsNewDay()) {
            cc.log("新的一天");
            this.score.RestDaily();
        }
        if (this.date.IsNewWeek()) {
            cc.log("新的一周");
            this.score.ResetWeek();
        }

        if (this.date.IsNewMonth()) {
            cc.log("新的一个月");
            this.score.ResetMonth();
            this.score.UpdateDayScore();
            this.map.UpdateMonthMap();
            this.select.UpdateMonth();
        }
        this.cache.SelectDate = { month: this.date.Month, day: this.date.Day - 1 };
        this.netRequest = this.node.getChildByName("NetWork").getComponent(NetRequest);

        this.cache.IsLogin = Utility.IsSignInGoogle();
        if (this.cache.IsLogin) {
            this.UpdateAccount();
        }
        Utility.DebugLog("==============谷歌登录====================>>" + this.cache.IsLogin.toString())
    }

    protected start(): void {
        GameEventMgr.Instance.AddEvent(Consts.Event.EAddScore, this.AddScore.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ESquare, this.SquareEvent.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EAddComboCount, this.AddComboCount.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ECancelCombo, this.CancelCobom.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EAddPlaceScore, this.AddPlaceScore.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EUpdateNormalMatrix, this.UpdateNormalMapMatrix.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EUpdateNormalScore, this.UpdateNormalScore.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EUpdateMapMatrix, this.UpdateMapMatrix.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EFinishChessGuidStep, this.FinishChessGuidStep.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ESettingChangeState, this.SettingChangeState.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EEventComplete, this.EventComplete.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ESetGAID, this.SetGAIDEvent.bind(this), this);

        GameEventMgr.Instance.AddEvent(Consts.Event.ESignGoogle, this.ESignGoogle.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ESignOutGoogle, this.ESignOutGoogle.bind(this), this);



        this.schedule(this.Tick.bind(this), 5);
        this.SetDailyBlockProbability();

        //这里时因为cocos 初始化粒子特别慢
        this.scheduleOnce(() => {
            let obj = this.effectPool.Pop(Consts.ResName.EliminateEffect);
            this.node.addChild(obj);
            obj.setPosition(cc.v3(5000, 5000));
        }, 0.2);

        this.scheduleOnce(() => {
            let obj = this.effectPool.Pop(Consts.ResName.RecordBreaking);
            this.node.addChild(obj);
            obj.setPosition(cc.v3(5000, 5000));
        }, 0.5);

        this.scheduleOnce(() => {
            let obj = this.effectPool.Pop(Consts.ResName.RecordBehindEffect);
            this.node.addChild(obj);
            obj.setPosition(cc.v3(5000, 5000))
        }, 0.7);

        this.scheduleOnce(() => {
            let obj = this.effectPool.Pop(Consts.ResName.ColourBar);
            this.node.addChild(obj);
            obj.setPosition(cc.v3(5000, 5000));
        }, 1.5);

        this.scheduleOnce(() => {
            let obj = this.effectPool.Pop(Consts.ResName.FangkuaixiaochuEffect);
            this.node.addChild(obj);
            obj.setPosition(cc.v3(50000, 50000));
        }, 0.5);


        this.isFirst = this.data.First;
        if (!this.data.First) {
            cc.log("用户第一次打开")
            this.data.First = true;
            SDKMgr.Instance.SendOpenFirstEvent();
            if (this.data.MyId != "") {
                if (this.data.GetScoreRandList().length == 0) {
                    this.Net.GetScoreTopRankList();
                }

                this.Net.GetScoreFrontAndAfterRankList();
                this.Net.GetRectangleFrontAndAfterRankList();
            }
        } else {
            this.scheduleOnce(() => {
                // this.Net.GetScoreTopRankList();
                // this.Net.GetScoreFrontAndAfterRankList();
                // this.Net.GetRectangleFrontAndAfterRankList();
            }, 2);
        }
    }

    private Tick() {
        this.date.WriteData();
        this.map.WriteData();
        this.score.WriteData();
        this.select.WriteData();
        this.gameGuide.WriteData();
        this.reward.WriteData();
        this.data.WriteData();
        // this.warehouse.WriteData();
    }

    public get TileConfig() {
        return this.config.GetConf<TileConfig>("TileConfig");
    }

    public get MapConfig() {
        return this.config.GetConf<MapConfig>("MapConfig");
    }

    public get BlockConfig() {
        return this.config.GetConf<BlockConfig>("BlockConfig");
    }

    public get TerrainConfig() {
        return this.config.GetConf<TerrainConfig>("TerrainConfig");
    }

    public get DailyConfig() {
        return this.config.GetConf<DailyDataConfig>(Consts.ResName.DailyDataConfig);
    }

    /**失败配置*/
    public get DifficultyConfig() {
        return this.config.GetConf<DifficultyConfig>(Consts.ResName.DifficultyConfig);
    }

    /**失败配置*/
    public get BlockTypeConfig() {
        return this.config.GetConf<BlockTypeConfing>(Consts.ResName.BlockTypeConfing);
    }

    /**失败配置*/
    public get EventDataConfig() {
        return this.config.GetConf<EventDataConfig>(Consts.ResName.EventDataConfig);
    }

    public get EventTimeConfig() {
        return this.config.GetConf<EventTimeConfig>(Consts.ResName.EventTimeConfig);
    }

    public get DailyChallengesConfig() {
        return this.config.GetConf<DailyChallengesConfig>(Consts.ResName.DailyChallengesConfig);
    }

    public get EffectPool() {
        return this.effectPool;
    }

    public get ColorNodePool() {
        return this.colorPool;
    }

    /**游戏引导 */
    public get GameGuide() {
        return this.gameGuide;
    }

    public get Reward() {
        return this.reward;
    }

    public get Data() {
        return this.data;
    }



    /**初始化 */
    public Init() {
        this.cache.DailyFinish = null;
        this.cache.Combo = 0;
        this.cache.GameOver = false;
        let length = this.TileConfig.GetNormalTileListLength();
        let index = Utility.RandomRangeInt(0, length - 1);
        this.tileColorList = [index, index, index, index];
    }

    /**设置随机方块几率 */
    private SetDailyBlockProbability() {
        let data = this.GetDailyIndex();
        let count = this.map.GetDailyFailedNum(data.first, data.second);
        let dConfList = this.DifficultyConfig.GetConf();

        for (let i = 0; i < dConfList.length; i++) {
            if (count <= dConfList[i].FaildNum) {
                this.cache.DailyProList = dConfList[i].Type;
                return;
            }
        }
    }

    /**事件方块概率 */
    public SetEventBlockProbability() {
        let count = this.map.GetEventFailedNum(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName);
        let dConfList = this.DifficultyConfig.GetConf();
        for (let i = 0; i < dConfList.length; i++) {
            if (count <= dConfList[i].FaildNum) {
                this.cache.EventProList = dConfList[i].Type;
                return;
            }
        }
    }

    /**增加失败次数 */
    public AddFaileCount() {
        if (this.cache.GameType == GameType.DailyType) {
            let data = this.GetDailyIndex();
            this.map.AddDailyFailedNum(data.first, data.second);
            this.SetDailyBlockProbability();
        } else if (this.cache.GameType == GameType.EventType) {
            this.map.AddEventFailedNum(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName);
            this.SetEventBlockProbability();
        }
    }

    public GetBlockType() {
        if (this.cache.GameType == GameType.NormalType) {
            return Utility.RandomRangeInt(0, this.BlockConfig.GetAllBlock().length - 1);
        } else if (this.cache.GameType == GameType.DailyType) {
            let value = Utility.RandomRangeInt(0, 100);
            let pro = 0;
            let type = 0;

            for (let i = 0; i < this.cache.DailyProList.length; i++) {
                pro += this.cache.DailyProList[i];
                if (value <= pro) {
                    type = i + 1;
                    break;
                }
            }
            let blockList = this.BlockTypeConfig.GetBlockTypeList(type);
            let index = Utility.RandomRangeInt(0, blockList.length - 1);
            return blockList[index].Id - 1;
        } else if (this.Cache.GameType == GameType.EventType) {
            let value = Utility.RandomRangeInt(0, 100);
            let pro = 0;
            let type = 0;

            for (let i = 0; i < this.cache.EventProList.length; i++) {
                pro += this.cache.EventProList[i];
                if (value <= pro) {
                    type = i + 1;
                    break;
                }
            }
            let blockList = this.BlockTypeConfig.GetBlockTypeList(type);
            let index = Utility.RandomRangeInt(0, blockList.length - 1);
            return blockList[index].Id - 1;
        }
    }

    /**日期*/
    public get Date() {
        return this.date;
    }

    /**分数 */
    public get Score() {
        return this.score;
    }

    public get Cache() {
        return this.cache;
    }

    /**地图数据 */
    public get Map() {
        return this.map;
    }

    public get Select() {
        return this.select;
    }

    /**获取日期进度 */
    public GetDateProgress(month: number, day: number) {
        let index = this.GetMonthIndex(month);
        let data = this.score.GetDailyData(index, day - 1);
        let item = this.DailyConfig.GetDailyConf(month, day - 1);
        return {
            currentScore: data.s,
            history: data.h,
            maxScore: item.score,
            isLock: index == 0 && day > this.date.Day
        }
    }

    /**每日挑战解锁 */
    public IsDailyLock(month: number, day: number) {
        let index = this.GetMonthIndex(month);
        return index == 0 && day > this.date.Day;
    }


    /**增加分数 */
    private AddScore(score: number) {
        if (this.cache.GameType == GameType.NormalType) {
            this.score.AddNormalScore(score);
            let reList = this.score.RecordList();
            if (reList.length > 0) {
                cc.log("破纪录", reList);
                GameEventMgr.Instance.EmitEvent(reList[reList.length - 1]);
            }

        } else if (this.Cache.GameType == GameType.DailyType) {
            let data = this.GetDailyIndex();
            // score += 1000;
            this.score.AddDailyScore(data.first, data.second, score);
            let ds = this.GetCurrentScore();
            let ms = this.GetTargetScore();
            let hs = this.GetSelectDailyHistoryScore();
            this.cache.DailyFinish = null;
            let month = this.cache.SelectDate.month;
            let day = this.cache.SelectDate.day;
            //通过关卡
            if (ds >= ms) {
                if (hs == 0) {
                    this.cache.DailyFinish = { month: month, day: day };
                }
                this.cache.GameOver = true;
                this.score.UpdateDailyHistoryScore(data.first, data.second, ms);
                GameEventMgr.Instance.EmitEvent(Consts.Event.ECompleteDilyChallenges);
            }
        } else if (this.Cache.GameType == GameType.EventType) {
            //事件模式
            this.score.AddEventScore(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName, score);
            let maxScore = this.GetTargetScore();
            let currentScore = this.GetCurrentScore();
            if (currentScore >= maxScore) {
                this.cache.GameOver = true;
                this.score.UpdateEventHistoryScore(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName, maxScore);
                GameEventMgr.Instance.EmitEvent(Consts.Event.ECompleteEventChallenges);
            }
        }

        GameEventMgr.Instance.EmitEvent(Consts.Event.EUpdateCurrentScore);
    }
    /**田字格消除数 */
    private SquareEvent() {
        this.data.AddSquare();
        // this.Net.UpdateRectangleNum(this.data.Square);
        cc.log("田字格消除");
    }

    private GetMonthIndex(month: number) {
        let index = this.date.Month - month;
        if (index < 0) {
            index += 12;
        }
        return index;
    }

    /**放置积分 */
    private AddPlaceScore(count: number) {
        let score = 1;
        this.AddScore(count * score);
    }

    /**刷新普通地图矩阵 */
    private UpdateNormalMapMatrix(matrix: number[]) {
        this.map.UpdateNormalMap(matrix)
    }

    /**刷新 日矩阵*/
    public UpdateMapMatrix(matrix: number[], countList: number[]) {
        if (this.cache.GameType == GameType.DailyType) {
            let data = this.GetDailyIndex();
            let list = this.map.DailyTileCount(data.first, data.second);
            if (list.length == 0) {
                SDKMgr.Instance.DailyChallengesEvent(0, this.cache.SelectDate.month, this.cache.SelectDate.day);
                SDKMgr.Instance.GameModelCensus(this.cache.GameType, GameState.Open);
                this.map.SetDailyStartTime(data.first, data.second);
            }
            this.map.UpdateDailyMap(data.first, data.second, matrix, countList);
        } else if (this.cache.GameType == GameType.EventType) {

            let list = this.map.EventTileCount(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName);
            if (list.length == 0) {
                SDKMgr.Instance.EventChallengesEvent(0, this.cache.SelectEvent.index, this.cache.SelectEvent.eventName);
                SDKMgr.Instance.GameModelCensus(this.cache.GameType, GameState.Open);
                this.map.SetEventStartTime(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName);
            }

            this.map.UpdateEventMap(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName, matrix, countList);
        }
    }

    /**获取历史积分 */
    public GetSelectDailyHistoryScore() {
        let data = this.GetDailyIndex();
        return this.score.GetDailyData(data.first, data.second).h;
    }

    /**获取地图Index*/
    public GetMapIndex() {
        if (this.cache.GameType == GameType.DailyType) {
            let date = this.cache.SelectDate;
            let item = this.DailyConfig.GetDailyConf(date.month, date.day);
            return { tIndex: item.tIndex, mIndex: item.mIndex };
        } else if (this.cache.GameType == GameType.GuideType) {
            let data = { tIndex: this.guideTerrain + this.GameGuide.NormalGuideStep - 1, mIndex: 0 }
            return data;
        } else if (this.cache.GameType == GameType.EventType) {
            let select = this.cache.SelectEvent;
            let item = this.EventDataConfig.GetEventConf(select.index, select.eventName);
            let data = { tIndex: item.tIndex, mIndex: item.mIndex };
            return data;
        }
    }

    /**清理地图 */
    private ClearlMap() {
        if (this.cache.GameType == GameType.NormalType) {
            this.map.ClearNormalMap();
        } else if (this.cache.GameType == GameType.DailyType) {
            let data = this.GetDailyIndex();
            this.map.ClearDailyMap(data.first, data.second);
        } else if (this.cache.GameType == GameType.EventType) {
            this.map.ClearEventMap(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName);
        }
    }

    /**获取挑战星 */
    public GetDailyStarCount() {
        let data = this.GetDailyIndex();
        let days = this.date.GetTotalDays(this.date.Year, this.date.Month);
        let count = 0;
        for (let i = 0; i < days; i++) {
            let temp = this.score.GetDailyData(data.first, i);
            let maxScore = this.DailyConfig.GetScore(this.cache.SelectDate.month, i);
            if (temp.h >= 100 || temp.h >= maxScore) {
                count++;
            }
        }
        return count;
    }

    private GetDailyIndex() {
        let date = this.cache.SelectDate;
        let index = this.GetMonthIndex(date.month);
        return { first: index, second: date.day };
    }

    private ClearScore() {
        if (this.cache.GameType == GameType.NormalType) {
            this.score.ClearNormalScore();
        } else if (this.cache.GameType == GameType.DailyType) {
            let data = this.GetDailyIndex();
            this.score.ClearDailyScore(data.first, data.second);
        } else if (this.cache.GameType == GameType.EventType) {
            this.score.ClearEventScore(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName);
        }
    }


    /**清理 */
    public Clear() {
        this.ClearScore();
        this.ClearlMap();
        this.ClearSelectBlockList();
    }


    /**取消连击 */
    private CancelCobom() {
        this.cache.Combo = 0;
    }

    /**增加连击数 */
    private AddComboCount(combo: number) {
        this.cache.Combo += combo;
    }

    /**获取当前分数 */
    public GetCurrentScore() {
        if (this.cache.GameType == GameType.NormalType || this.cache.GameType == GameType.GuideType) {
            return this.score.Score;
        } else if (this.cache.GameType == GameType.DailyType) {
            let data = this.GetDailyIndex();
            return this.score.GetDailyData(data.first, data.second).s;
        } else if (this.cache.GameType == GameType.EventType) {
            return this.score.GetEventData(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName).s;
        }
    }

    public GetTargetScore() {
        if (this.cache.GameType == GameType.DailyType) {

            let date = this.cache.SelectDate;
            return this.DailyConfig.GetDailyConf(date.month, date.day).score;
            // let data = this.GetDailyIndex();
            // return this.score.GetDailyData(data.first, data.second).ms;
        } else if (this.cache.GameType == GameType.EventType) {
            return this.EventDataConfig.GetEventConf(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName).score;
        }
    }


    private UpdateNormalScore() {
        this.score.UpdateNormalScore();
    }

    public UpdateSelect(b: { blockType: number, isPlace: boolean, isWarehouse: boolean, tileColor: number[] }[]) {
        if (this.cache.GameType == GameType.NormalType) {
            this.select.UpdateNormalSelect(b);
        } else if (this.cache.GameType == GameType.DailyType) {
            let data = this.GetDailyIndex();
            this.select.UpdateDailyBlockSelect(data.first, data.second, b);
        } else if (this.cache.GameType == GameType.EventType) {
            this.select.UpdateEventBlockSelect(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName, b);
        }
    }

    /**获取选择块列表 */
    public GetSelectBlockList() {
        if (this.cache.GameType == GameType.NormalType) {
            return this.select.NormalBlockList();
        } else if (this.cache.GameType == GameType.DailyType) {
            let data = this.GetDailyIndex();
            return this.select.DailyBlockList(data.first, data.second);
        } else if (this.cache.GameType == GameType.GuideType) {
            return this.gameGuide.GetBlockList();
        } else if (this.cache.GameType == GameType.EventType) {
            return this.select.EventBlockList(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName);
        }
    }

    /**清理选择的方块*/
    private ClearSelectBlockList() {
        if (this.cache.GameType == GameType.NormalType) {
            this.select.ClearNormalBlockList();
        } else if (this.cache.GameType == GameType.DailyType) {
            let data = this.GetDailyIndex();
            this.select.ClearDailyBlockList(data.first, data.second);
        } else if (this.cache.GameType == GameType.EventType) {
            this.select.ClearEventBlockList(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName);
        }
    }

    /**地图矩阵*/
    public MapMatrix() {
        if (this.cache.GameType == GameType.NormalType) {
            // cc.log(this.map.NormalMap())
            if (this.map.NormalMap().length == 0) {
                return this.NormalMatrix();
            }
            return this.map.NormalMap();
        } else if (this.cache.GameType == GameType.DailyType) {
            let data = this.GetDailyIndex();
            return this.map.DailyMap(data.first, data.second);
        } else if (this.cache.GameType == GameType.GuideType) {
            return [];
        } else if (this.cache.GameType == GameType.EventType) {
            let select = this.cache.SelectEvent
            return this.map.EventMap(select.index, select.eventName);
        }
    }

    /**获取Tile的个数 */
    public GetTileCount(index: number, type: number) {
        if (this.cache.GameType == GameType.NormalType) {
            return 1;
        } else if (this.cache.GameType == GameType.DailyType) {
            let data = this.GetDailyIndex();
            let count = this.map.DailyTileCount(data.first, data.second)[index];
            if (count == null) {
                let date = this.cache.SelectDate;
                return this.DailyConfig.GetTypeCount(date.month, date.day, type);
            }
            return count
        } else if (this.cache.GameType == GameType.EventType) {
            let count = this.map.EventTileCount(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName)[index];
            if (count == null) {
                let conf = this.EventDataConfig.GetEventConf(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName);
                return conf.typeCount[type]
            }
            return count;
        } else if (this.cache.GameType == GameType.GuideType) {
            return 1;
        }
    }


    /**继续每日挑战 */
    public ContinueDailyChallenges() {
        let data = this.GetDailyIndex();
        let selectDate: { month: number, day: number } = null;

        let index = data.first;
        let date = this.date.GetPreviousDate(index);
        let days = this.date.GetTotalDays(date.year, date.month - 1);
        let lastDay = days - 1;

        for (let j = data.second; j < days; j++) {
            if (!this.IsDailyLock(date.month, j + 1)) {
                let dailyDate = this.score.GetDailyData(index, j);
                if (dailyDate.h == 0) {
                    selectDate = { month: date.month, day: j };
                    return selectDate;
                }
                lastDay = j;
            } else {
                break;
            }
        }

        for (let j = data.second - 1; j >= 0; j--) {
            if (!this.IsDailyLock(date.month, j + 1)) {
                let dailyDate = this.score.GetDailyData(index, j);
                if (dailyDate.h == 0) {
                    selectDate = { month: date.month, day: j };
                    return selectDate
                }
            }
        }
        return { month: date.month, day: lastDay };
    }

    /**获取事件默认选择 */
    public GetEventDefaultSelect() {
        let eventList: string[][] = [];
        let arr = this.score.GetEventScoreList();

        for (let i = 0; i < arr.length; i++) {
            let data = arr[i];
            let keys = Object.keys(data);
            eventList[i] = [];
            for (let k of keys) {
                let value = data[k];
                let item = this.EventDataConfig.GetEventConf(i, k);
                if (value.h < item.score) {
                    eventList[i].push(k);
                }
            }
        }

        for (let i = 0; i < eventList.length; i++) {
            if (eventList[i].length != 0) {
                return { index: i, arr: eventList[i] }
            }
        }

        return { index: -1, arr: [] };
    }

    /**普通模式矩阵 */
    private NormalMatrix() {
        return this.MapConfig.GetAllMap()[0];
    }

    public GetTileColorRandom() {
        return this.tileColorList;
    }

    public FinishChessGuidStep() {
        this.GameGuide.NormalGuideStep++;
    }
    /**完成每日挑战 */
    public CompleteDailyChallenges() {
        let data = this.GetDailyIndex();
        let start = this.map.GetDailyStartTime(data.first, data.second);
        SDKMgr.Instance.DailyChallengesEvent(1, this.cache.SelectDate.month, this.cache.SelectDate.day);
        SDKMgr.Instance.DailyChallengesFinishTime(this.cache.SelectDate.month, this.cache.SelectDate.day, start);
        SDKMgr.Instance.GameModelCensus(this.cache.GameType, GameState.Success);
    }
    /**完成事件挑战 */
    public CompleteEventChallenges() {
        let start = this.map.GetEventStartTime(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName);
        SDKMgr.Instance.EventChallengesEvent(1, this.cache.SelectEvent.index, this.cache.SelectEvent.eventName);
        SDKMgr.Instance.EventChallengesFinishTime(this.cache.SelectEvent.index, this.cache.SelectEvent.eventName, start);
        SDKMgr.Instance.GameModelCensus(this.cache.GameType, GameState.Success);
    }

    protected onDestroy(): void {
        this.EffectPool.Clear();
        this.colorPool.Clear();
        GameEventMgr.Instance.Reset();
    }
    /**设置状态 */
    private SettingChangeState(sound: number, vibrate: number) {
        this.data.SoundOff = sound;
        this.data.VibrateOff = vibrate;
        // cc.log(this.data.SoundOff, sound, vibrate)
        if (this.data.SoundOff == 1) {
            AudioMgr.Instance.PauseAll();
        }
    }

    /**事件完成 */
    private EventComplete() {
        Game.Instance.Date.EventTime = Game.Instance.EventTimeConfig.OpenEvent().End;
    }

    /**网络*/
    public get Net() {
        return this.netRequest;
    }

    /**设置Gaid */
    public SetGAIDEvent(gaid: string) {
        this.data.MyId = gaid;
        if (!this.isFirst) {
            // this.Net.GetScoreTopRankList();
            // this.Net.GetRectangleTopRankList();

            this.Net.GetScoreFrontAndAfterRankList();
            this.Net.GetRectangleFrontAndAfterRankList();
            Utility.DebugLog("获取排行榜数据");
        }
    }

    public ESignGoogle() {
        this.cache.IsLogin = true;
        this.UpdateAccount();
        this.Net.UpdateScore(this.Score.History, this.cache.Account.name);
        this.Net.UpdateScore(this.data.Square);
    }

    public ESignOutGoogle() {
        this.cache.IsLogin = false;
        this.Net.UpdateScore(this.Score.History, this.cache.Account.name);
        this.Net.UpdateScore(this.data.Square);
    }

    /**刷新用户*/
    public UpdateAccount() {
        this.cache.Account.name = Utility.GetAccountName();
        this.cache.Account.email = Utility.GetAccountEmail();
        this.Cache.Account.id = Utility.GetAccountId();
    }
}
