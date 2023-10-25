/**块的颜色 */
export enum TileColor {
    None,
    Shadow,
    FriendlyTips,
    TileColor1,
    TileColor2,
    TileColor3,
    TileColor4,
    TileColor5,
    TileColor6,
    TileColor7,
    TileColor8,
}

/**游戏类型 */
export enum GameType {
    /**普通模式*/
    NormalType,
    /**每日挑战*/
    DailyType,
    /**事件模式*/
    EventType,
    /** 引导模式*/
    GuideType
}

/**平台*/
export enum Platform {
    /**web */
    Web,
    /**安卓*/
    Android,
}

/**事件状态*/
export enum EventStatus {
    Close,
    Open,
    Finish
}

export enum GameState {
    Open,
    Failed,
    Success,
}