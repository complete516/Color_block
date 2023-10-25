import { GameType } from "../Consts/Define";

export default class GameCache {
    /**连击数 */
    private combo: number = 0;
    /**游戏类型 */
    private gameType: GameType = 0;
    /**选择日期*/
    private selectDate: { month: number, day: number } = null;
    /**每日挑战几率 */
    private dailyProList: number[] = [];
    private eventProList: number[] = [];
    /**每日挑战完成 */
    private dailyFinish: { month: number, day: number } = null;
    /**选择的事件 */
    private selectEvent: { index: number, eventName: string } = null;
    /**游戏结束标记*/
    private isGameOver: boolean = false;
    /**当前选择事件 */
    private currentEventIndex: number = -1;
    /**当前选择方块类型 */
    private currentSelectBlockType: number = -1;

    private tileTypeList: { blockType: number, isPlace: boolean, tileColor: number[] }[] = [];

    private rankList: { uname: string, order: number, score: string, uid: number }[] = [];
    private ranSquarekList: { uname: string, order: number, score: string, uid: number }[] = [];

    public networkerror: boolean = false;

    public inputStr: string = "";

    /**用户是否登录 */
    public IsLogin: boolean = false;
    /**账户信息 */
    public Account: { name: string, email: string, id: string } = { name: "", email: "", id: "" };

    /**连击次数 */
    public get Combo() {
        return this.combo;
    }

    public set Combo(value: number) {
        this.combo = value;
    }

    /**游戏类型 */
    public get GameType() {
        return this.gameType;
    }

    /**游戏类型 */
    public set GameType(value: GameType) {
        this.gameType = value;
    }

    /**选择日期*/
    public set SelectDate(value: { month: number, day: number }) {
        this.selectDate = value;
    }

    public get SelectDate() {
        return this.selectDate;
    }

    /**每日挑战几率 */
    public get DailyProList() {
        return this.dailyProList;
    }

    public set DailyProList(value: number[]) {
        this.dailyProList = value;
    }

    /**事件模式挑战几率 */
    public get EventProList() {
        return this.eventProList;
    }

    public set EventProList(value: number[]) {
        this.eventProList = value;
    }

    /**每日挑战 */
    public set DailyFinish(value: { month: number, day: number }) {
        this.dailyFinish = value;
    }

    public get DailyFinish() {
        return this.dailyFinish;
    }

    public set SelectEvent(value: { index: number, eventName: string }) {
        this.selectEvent = value;
    }

    public get SelectEvent() {
        return this.selectEvent;
    }

    public set GameOver(value: boolean) {
        this.isGameOver = value;
    }

    public get GameOver() {
        return this.isGameOver;
    }

    public set CurrentEventIndex(value: number) {
        this.currentEventIndex = value;
    }

    public get CurrentEventIndex() {
        return this.currentEventIndex;
    }

    public set CurrentBlockType(value: number) {
        this.currentSelectBlockType = value;
    }

    public get CurrentBlockType() {
        return this.currentSelectBlockType;
    }

    /**块类型 */
    public get TileTypeList() {
        return this.tileTypeList;
    }

    public set TileTypeList(value: { blockType: number, isPlace: boolean, tileColor: number[] }[]) {
        this.tileTypeList = value;
    }

    /**更新排行榜 */
    public UpdateScoreRankList(rankList: { uname: string, order: number, score: string, uid: number }[]) {
        this.rankList = rankList;
    }

    /**更新排行榜 */
    public UpdateSquareRankList(rankList: { uname: string, order: number, score: string, uid: number }[]) {
        this.ranSquarekList = rankList;
    }

    /**排行榜数据 */
    public GetScoreRankList() {
        return this.rankList;
    }

    public GetSquareRankList() {
        return this.ranSquarekList;
    }
}