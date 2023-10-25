import { Platform, TileColor } from "./Define";


export default class Consts {
    public static TilePropertyList: { tileColor: TileColor, spriteFrame: string, color: cc.Color, fontColor: cc.Color }[] = [
        { tileColor: TileColor.TileColor1, spriteFrame: "kuai2", color: cc.color(248, 113, 96), fontColor: cc.color(0xfd, 0xde, 0xb8) },
        { tileColor: TileColor.TileColor2, spriteFrame: "kuai3", color: cc.color(90, 194, 247), fontColor: cc.color(0x20, 0x7a, 0xcc) },
        { tileColor: TileColor.TileColor4, spriteFrame: "kuai5", color: cc.color(250, 193, 86), fontColor: cc.color(0xe4, 0x76, 0x41) },
        { tileColor: TileColor.TileColor3, spriteFrame: "kuai7", color: cc.color(235, 139, 105), fontColor: cc.color() },
        { tileColor: TileColor.TileColor5, spriteFrame: "kuai6", color: cc.Color.BLACK, fontColor: cc.Color.BLACK },
        { tileColor: TileColor.TileColor6, spriteFrame: "kuai4", color: cc.Color.BLACK, fontColor: cc.Color.BLACK },
        { tileColor: TileColor.TileColor7, spriteFrame: "kuai8", color: cc.Color.BLACK, fontColor: cc.Color.BLACK },
    ]

    public static Event = {
        EToucnBlock: "EToucnBlock",
        /**移动方块 */
        ETouchMoveBlock: "ETouchMoveBlock",
        /**方块移动结束 */
        ETouchEndBlock: "ETouchEndBlock",
        /**和棋盘相交*/
        EUnionChessboard: "EUnionChessboard",
        /**和棋盘不相交 */
        ENotUnionChessboard: "ENotUnionChessboard",
        /**相交移动 */
        EUnionMove: "EUnionMove",
        /**不相交移送 */
        ENotUnionMove: "ENotunionMove",
        /**显示阴影 */
        EShowShadow: "EShowShadow",
        /**检查方块位置 */
        ECheckBlockLocation: "ECheckBlockLocation",
        /**放入仓库*/
        EPutIntoWarehouse: "EPutIntoWarehouse",
        // /**从仓库中拿出*/
        // ETakeOutWarehouse: "ETakeOutWarehouse",
        /**消除方块 */
        // EEliminateBlock: "EEliminateBlock",
        /**正方形消除 */
        // ERectangleEliminate: "ERectangleEliminate",
        /**统一消除*/
        EUnifyEliminate: "EUnifyEliminate",
        /**检测游戏状态 */
        ECheckGameState: "ECheckGameState",
        /**放置方块*/
        EPlaceBlock: "EPlaceBlock",
        /**方块可以放置 */
        EBlockCanPlace: "EBlockCanPlace",
        /**增加分数*/
        EAddScore: "EAddScore",
        /**田字格消除 */
        ESquare: "ESquare",
        /**加分动作 */
        EAddScoreAction: "EAddScoreAction",
        /**更新当前分数*/
        EUpdateCurrentScore: "EUpdateCurrentScore",
        /**天记录 */
        EDayRecord: "EDayRecord",
        /**周记录 */
        EWeekRecord: "EWeekRecord",
        /**月记录 */
        EMonthRecord: "EMonthRecord",
        /**历史记录 */
        EHistoryRecord: "EHistoryRecord",
        /**更新普通模式分数*/
        EUpdateNormalScore: "EUpdateNormalScore",
        /**方块消除高亮 */
        ERectangleBlockHighlight: "ERectangleBlockHighlight",
        /**相同方块高亮*/
        ESameBlockHighlight: "ESameBlockHighlight",
        /**取消高亮*/
        ECanCelSameBlockHighlight: "ECanCelSameBlockHighlight",
        /**增加连击数*/
        EAddComboCount: "EAddComCount",
        /**取消连击*/
        ECancelCombo: "ECancelCombo",
        /**连击动作 */
        EComboAction: "EComboAction",
        /**增加放置分 */
        EAddPlaceScore: "EAddPlaceScore",
        //游戏状态事件
        /**开始新游戏 */
        EStartNewGame: "EStartNewGame",
        /**继续游戏 */
        EContinueGame: "EContinueGame",
        /**返回主界面 */
        EBackMainView: "EBackMainView",
        /**每日挑战 */
        EDailyChallenges: "EDailyChallenges",
        /**事件挑战 */
        EEventChallenges: "EEventChallenges",
        /**游戏结束事件*/
        EGameOver: "EGameOver",
        /**游戏失败 */
        EGameFailed: "EGameFailed",
        /**更新普通地图数据 */
        EUpdateNormalMatrix: "EUpdateNormalMatrix",
        /**更新每日挑战 */
        EUpdateMapMatrix: "EUpdateMapMatrix",
        /**完成每日挑战 */
        ECompleteDilyChallenges: "ECompleteDilyChallenges",
        /**完成事件挑战*/
        ECompleteEventChallenges: "ECompleteEventChallenges",
        /**开始新手教程 */
        EStartChessGuidStep: "EStartChessGuidStep",
        /**完成一步棋盘新手教程 */
        EFinishChessGuidStep: "EFinishChessGuidStep",
        /**重新开始新手教程*/
        EResetChessGuidStep: "EResetChessGuidStep",
        /**完成新手教程 */
        EFinishChessGuid: "EFinishChessGuid",

        ESettingChangeState: "ESettingChangeState",
        /**重新检查时间模式 */
        EResetCheckEvent: "EResetCheckEvent",

        EEventComplete: "EEventComplete",

        /**开始玩事件挑战 */
        EStartPlayEventGame: "EStartPlayEventGame",
        /**开始友情提示*/
        EStartFriendlyTips: "EStartFriendlyTips",
        /**显示友情提示 */
        EShowFriendlyTips: "EShowFriendlyTips",
        // EEndFriendlyTips: "EEndFriendlyTips",

        ESquareEffect: "ESquareEffect",
        /**矩形提示*/
        EStartRectanglePrompt: "EStartRectanglePrompt",
        EEndRectanglePrompt: "EEndRectanglePrompt",
        /**网络错误 */
        ENetworkError: "ENetworkError",

        ESetGAID: "ESetGAID",
        /**更新排行数据 */
        EUpdateRankData: "EUpdateRankData",
        ETopRankData: "ETopRankData",
        ETextChange: "ETextChange",

        EChangeName: "EChangeName",
        ECancelChangeName: "ECancelChangeName",

        ESignGoogle: "ESignGoogle",
        ESignOutGoogle: "ESignOutGoogle",
        /**关闭设置界面 */
        ECloseSetting: "ECloseSetting",
    }

    public static ResName = {
        TileFile: "TileFile",
        Tile: "Tile",
        Shadow: "TileShadow",
        /**底板 */
        Floor: "kuai1",
        BlockConfig: "BlockConfig",
        MapConfig: "MapConfig",
        TerrainConfig: "TerrainConfig",
        TileConfig: "TileConfig",
        DailyDataConfig: "DailyDataConfig",
        DifficultyConfig: "Difficulty",
        BlockTypeConfing: "BlockType",
        PtGuideView: "PtGuideView",
        EventDataConfig: "EventDataConfig",
        EventTimeConfig: "EventTime",
        DailyChallengesConfig: "DailyChallenges",
        Mask: "Mask",
        SettView: "SettView",
        SquareEffect: "SquareEffect",
        WhiteView: "WhiteView",
        EventView: "EventView",
        EventEndView: "EventEndingView",
        EventGameStateView: "EventGameStateView",
        RectanglePromptTips: "RectanglePromptTips",
        RankView: "LeagerView",
        NameSure: "NameSure",
        Config: "Config",
        Sound: "Sound",
        GameView: "GameView",
        MainView: "MainView",
        GameOverView: "EndingView",
        DailyGuideView: "DailyGuideView",
        GuidMask: "GuidMask",
        MainGuide: "MainGuide",
        DailyBlock: "DailyBlock",
        EventBlock: "EventBlock",
        GameNode: "GameNode",
        WindowMask: "WindowMask",
        DailyEndingView: "DailyEndingView",
        /**消除特效 */
        EliminateEffect: "EliminateEffect",
        /**消除特效 */
        RectangleEffect: "RectangleEffect",
        Font: "PingFang Bold",
        GetImage: "GetImage",
        /**破纪录 */
        RecordBreaking: "RecordBreaking",
        RecordBehindEffect: "caidia_down_02",
        ColourBar: "ColourBar",
        GetCupView: "GetCupView",
        FangkuaixiaochuEffect: "FangkuaixiaochuEffect",

        //sound
        Button: "anniu",
        Fangzhichenggong: "fangzhichenggong",
        fangzhishibai: "fangzhishibai",
        pojilu: "pojilu",
        shengli: "shengli",
        shibai: "shibai",
        xiaochu: "xiaochu",
    };

    public static ResPath = {
        Tile: "Image/Tile",
        Prefab: "Prefab",
        Config: "Config",
        FGUIPath: "UI",
        Font: "Font",
        Effect: "Effect",
        Sound: "Sound",
    };

    /**游戏名字 */
    public static GameName: string = "coloer_block";
    /**一月~十二月*/
    public static readonly Months: string[] = [
        "January",
        "February ",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    /**天数 星期天 ~ 星期六*/
    public static readonly Days: string[] = [
        "S", "M", "T", "W", "T", "F", "S"
    ]

    /**每月天数 0润年 1平年*/
    public static readonly MonthDays: number[][] = [
        [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    ]

    public static readonly RecordTips: string[] = ["Today", "Week", "Month", "All-Time"];

    /**常数*/
    public static readonly Constant = {
        /**最多保留几个月的数据 */
        MaxKeepMonthCount: 4,
        /**默认分数*/
        Day: 0,
        Week: 0,
        Month: 0,
        History: 0,
        /**固定时间显示插屏广告 */
        FixedTimeInterstitial: 2 * 60,
    };

    /**游戏平台 */
    public static GamePlatform: Platform = Platform.Web;

    public static EventItemNum = [
        { num: { x: 4, y: 4 } },
        { num: { x: 5, y: 5 } },
        { num: { x: 6, y: 6 } },
    ];

    /**事件ItemName */
    public static EventItemList = [
        [
            "Item1_1", "Item2_6", "Item1_2", "Item2_5", "Item2_4", "Item3_4", "Item3_3", "Item1_3",
            "Item2_3", "Item3_2", "Item3_1", "Item1_4", "Item1_6", "Item2_2", "Item1_5", "Item2_1"
        ],
        [
            "Item3_1", "Item2_1", "Item2_2", "Item2_3", "Item3_2", "Item1_1", "Item3_3", "Item2_4", "Item3_4",
            "Item1_2", "Item1_3", "Item1_4", "Item3_5", "Item1_5", "Item1_6", "Item1_7", "Item3_6", "Item2_5",
            "Item3_7", "Item1_8", "Item3_8", "Item2_6", "Item2_7", "Item2_8", "Item3_9"
        ],
        [
            "Item2_1", "Item3_16", "Item3_15", "Item3_12", "Item3_13", "Item2_10", "Item3_11", "Item2_2", "Item1_3",
            "Item1_1", "Item2_8", "Item3_7", "Item3_10", "Item1_6", "Item2_3", "Item2_9", "Item1_7", "Item3_6", "Item3_9",
            "Item1_2", "Item2_6", "Item2_4", "Item1_8", "Item3_5", "Item3_14", "Item2_7", "Item1_4", "Item1_5", "Item2_5",
            "Item3_8", "Item2_11", "Item3_1", "Item3_2", "Item3_3", "Item3_4", "Item2_12"
        ],
    ]

    public static Version: string = "1.1.3";
    public static URL: string = "https://h5xiaoyouxi.oss-cn-beijing.aliyuncs.com/html5/colormatch/"

}

