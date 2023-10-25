import Consts from "./Consts/Consts";

/**主资源需要立刻加载的*/
export enum AssetType {
    None = 0,
    /**预制体 */
    Prefab,
    /**字体 */
    Font,
    /**音效 */
    Audio,
    /**精灵 */
    SpriteFrame,
    /**图集 */
    SpriteAtlas,
    /**json*/
    Json,
    /**FGui资源 */
    FGUI,
    /**骨骼动画 */
    Spine,
    /**材质 */
    Material,
}

/**资源加载类型 */
export enum ResLoadType {
    /**不加载 自己手动加载的*/
    None,
    /**优先加载 load的时候就加载*/
    First,
    /**分帧加载 这个需要设置一帧加载多少个资源 默认一帧加载5个资源*/
    Frame
}

/**资源数据 */
export class ResData {
    /**资源名字 */
    resName: string = "";
    /**路径 */
    path: string = "";
    /**资源名字 */
    fullPath: string = "";
    /**类型 */
    type: AssetType = AssetType.None;
    /**是否是目录 */
    isDirectory: boolean;
    /**bundle名称,如果是resources路径下为"" */
    bundleName: string = "";
    /**资源加载类型*/
    loadType: ResLoadType = ResLoadType.None;
    /**FGUI包名 */
    fGUIPackName: string = "";
    /**FGUI资源名字*/
    fGUIResName: string = "";
    /**
     * 
     * @param resName 资源名称
     * @param path 资源路径
     * @param type 资源类型
     * @param bundleName  bundle名称默认""在resources目录下
     * @param loadType 加载类型默认不加载
     * @param isDirectory 是否为目录
     * @param fPackName fgui包名
     * @param fResName fgui资源名
     */
    constructor(resName: string, path: string, type: AssetType, loadType: ResLoadType = ResLoadType.None,
        isDirectory: boolean = false,
        bundleName: string = "",
        fPackName: string = "",
        fResName: string = ""
    ) {
        this.type = type;
        this.path = path;
        this.isDirectory = isDirectory;
        this.resName = resName;
        this.bundleName = bundleName;
        this.loadType = loadType;
        this.fullPath = this.path + "/" + this.resName;
        this.fGUIPackName = fPackName;
        this.fGUIResName = fResName;
    }
}

export class ResMap {
    public static resConfigMap: Map<string, ResData> = new Map<string, ResData>([
        [Consts.ResName.TileFile, new ResData(Consts.ResName.TileFile, Consts.ResPath.Tile, AssetType.SpriteFrame, ResLoadType.First, true)],
        [Consts.ResName.Tile, new ResData(Consts.ResName.Tile, Consts.ResPath.Prefab, AssetType.Prefab, ResLoadType.First)],
        [Consts.ResName.GameNode, new ResData(Consts.ResName.GameNode, Consts.ResPath.Prefab, AssetType.Prefab, ResLoadType.First)],
        [Consts.ResName.Mask, new ResData(Consts.ResName.Mask, Consts.ResPath.Prefab, AssetType.Prefab, ResLoadType.First)],
        [Consts.ResName.SquareEffect, new ResData(Consts.ResName.SquareEffect, Consts.ResPath.Prefab, AssetType.Prefab, ResLoadType.First)],
        [Consts.ResName.RecordBreaking, new ResData(Consts.ResName.RecordBreaking, Consts.ResPath.Prefab, AssetType.Prefab, ResLoadType.First)],
        [Consts.ResName.ColourBar, new ResData(Consts.ResName.ColourBar, Consts.ResPath.Prefab, AssetType.Prefab, ResLoadType.First)],

        [Consts.ResName.EliminateEffect, new ResData(Consts.ResName.EliminateEffect, Consts.ResPath.Prefab, AssetType.Prefab, ResLoadType.First)],
        [Consts.ResName.FangkuaixiaochuEffect, new ResData(Consts.ResName.FangkuaixiaochuEffect, Consts.ResPath.Prefab, AssetType.Prefab, ResLoadType.First)],
        [Consts.ResName.RectangleEffect, new ResData(Consts.ResName.RectangleEffect, Consts.ResPath.Prefab, AssetType.Prefab, ResLoadType.First)],
        [Consts.ResName.RectanglePromptTips, new ResData(Consts.ResName.RectanglePromptTips, Consts.ResPath.Prefab, AssetType.Prefab, ResLoadType.First)],
        [Consts.ResName.RecordBehindEffect, new ResData(Consts.ResName.RecordBehindEffect, Consts.ResPath.Prefab, AssetType.Prefab, ResLoadType.First)],

        [Consts.ResName.WindowMask, new ResData(Consts.ResName.WindowMask, Consts.ResPath.Prefab, AssetType.Prefab, ResLoadType.First)],
        [Consts.ResName.Config, new ResData(Consts.ResName.Config, Consts.ResPath.Config, AssetType.Json, ResLoadType.First, true)],
        [Consts.ResName.Sound, new ResData(Consts.ResName.Sound, Consts.ResPath.Sound, AssetType.Audio, ResLoadType.First, true)],
        [Consts.ResName.Font, new ResData(Consts.ResName.Font, Consts.ResPath.Font, AssetType.Font, ResLoadType.First, true)],

        [Consts.ResName.MainView, new ResData(Consts.ResName.MainView, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "MainPackage", Consts.ResName.MainView)],
        [Consts.ResName.GetCupView, new ResData(Consts.ResName.GetCupView, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "MainPackage", Consts.ResName.GetCupView)],
        [Consts.ResName.GameView, new ResData(Consts.ResName.GameView, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "GamePackage", Consts.ResName.GameView)],
        [Consts.ResName.DailyGuideView, new ResData(Consts.ResName.DailyGuideView, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "DailyGuidePackage", Consts.ResName.DailyGuideView)],

        [Consts.ResName.SettView, new ResData(Consts.ResName.SettView, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "SetPackage", Consts.ResName.SettView)],
        [Consts.ResName.MainGuide, new ResData(Consts.ResName.MainGuide, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "RepublicPackage", Consts.ResName.MainGuide)],
        [Consts.ResName.WhiteView, new ResData(Consts.ResName.WhiteView, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "RepublicPackage", Consts.ResName.WhiteView)],
        [Consts.ResName.GameOverView, new ResData(Consts.ResName.GameOverView, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "PtEndingPackage", Consts.ResName.GameOverView)],
        [Consts.ResName.DailyEndingView, new ResData(Consts.ResName.DailyEndingView, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "DailyEndingPackage", Consts.ResName.DailyEndingView)],
        [Consts.ResName.PtGuideView, new ResData(Consts.ResName.PtGuideView, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "PtGuidePackage", Consts.ResName.PtGuideView)],
        [Consts.ResName.RankView, new ResData(Consts.ResName.RankView, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "LeadersPackage", Consts.ResName.RankView)],
        [Consts.ResName.NameSure, new ResData(Consts.ResName.NameSure, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "LeadersPackage", Consts.ResName.NameSure)],
        [Consts.ResName.EventView, new ResData(Consts.ResName.EventView, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "EventPackage", Consts.ResName.EventView)],
        [Consts.ResName.GetImage, new ResData(Consts.ResName.GetImage, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "EventPackage", Consts.ResName.GetImage)],
        [Consts.ResName.EventGameStateView, new ResData(Consts.ResName.EventGameStateView, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "EventPackage", Consts.ResName.EventGameStateView)],
        [Consts.ResName.EventEndView, new ResData(Consts.ResName.EventEndView, Consts.ResPath.FGUIPath, AssetType.FGUI, ResLoadType.First, false, "", "EventEndingPackage", Consts.ResName.EventEndView)],
    ]);

    private static firstResList: string[] = [];
    private static frameResList: string[] = [];

    public static Init() {
        this.resConfigMap.forEach((item) => {
            if (item.loadType == ResLoadType.First) {
                this.firstResList.push(item.resName);
            } else if (item.loadType == ResLoadType.Frame) {
                this.frameResList.push(item.resName);
            }
        });
    }

    /**获取资源列表 */
    public static get ResConfigMap() {
        return ResMap.resConfigMap;
    }

    /**优先需要加载的资源 */
    public static get FirstResList() {
        return ResMap.firstResList;
    }

    /**分帧加载的资源 */
    public static get FrameResList() {
        return ResMap.frameResList;
    }

    /**长度 */
    public static size() {
        return ResMap.resConfigMap.size;
    }
}

