import Consts from "../Consts/Consts";
import Utility from "../Utility";

/**日期 */
export default class GameDate {
    /**当前月 */
    private currentMonth: number = 0;
    /**当前天 */
    private currentDay: number = 0;
    /**当前年*/
    private currentYear: number = 0;
    /**最开始的月 */
    private baseMonth: number = 0;

    /**前一个日期 */
    private previousTime: number = 0;
    /**前一个周 */
    private weekTime: number = 0;

    private isChange: boolean = false;
    /**当前日期 */
    private currDate: Date = null;
    /**事件*/
    private eventTime: number = 0;


    constructor() {
        this.Init();
    }

    public Init() {
        this.SetDate();
        this.ReadData();

        if (this.baseMonth == 0) {
            this.baseMonth = this.currentMonth;
            this.isChange = true;
        }

        cc.log(`日期:${this.currentYear}-${this.currentMonth}-${this.currentDay}`);
    }

    public SetDate() {
        this.currDate = Utility.TimeFormat(Utility.TimeStamp());
        this.currentMonth = this.currDate.getMonth() + 1;
        this.currentDay = this.currDate.getDate();
        this.currentYear = this.currDate.getFullYear();
    }

    /**月 */
    public get Month() {
        return this.currentMonth;
    }

    /**天 */
    public get Day() {
        return this.currentDay;
    }

    /**年 */
    public get Year() {
        return this.currentYear;
    }

    /**获取以前的日期 */
    public GetPreviousDate(count: number) {
        let year = this.currentYear;
        let month = this.currentMonth - count;
        if (month < 1) {
            month = 12 - month;
            year--;
        }
        return { year: year, month: month };
    }

    /**总共天数*/
    public GetTotalDays(year: number, month: number) {
        if (this.IsLeap(year)) {
            return Consts.MonthDays[0][month];
        }
        return Consts.MonthDays[1][month];
    }

    public ThisMonthCalendar() {
        return this.GetCalendar(this.Year, 6);
    }

    /**获取日历 */
    public GetCalendar(year: number, month: number) {
        let days = Consts.MonthDays[1][month - 1];
        if (this.IsLeap(year)) {
            days = Consts.MonthDays[0][month - 1];
        }

        let date = new Date(`${year},${month},1`);
        let day = date.getDay();

        let calendar: { date: number, week: number }[] = [];
        for (let i = 0; i < days; i++) {
            let d = (i % 7 + day) % 7;
            calendar.push({ date: i + 1, week: d, });
        }
        return calendar;
    }

    public ReadData() {
        let obj = cc.sys.localStorage.getItem(this.ItemKey);
        if (obj) {
            let json = JSON.parse(obj);
            if (json) {
                this.baseMonth = json.month || this.baseMonth;
                this.previousTime = json.previous || this.previousTime;
                this.weekTime = json.week || this.weekTime;
                this.eventTime = json.event || this.eventTime;
            }
        }
    }

    public WriteData() {
        if (this.isChange) {
            let data = {
                month: this.baseMonth,
                previous: this.previousTime,
                week: this.weekTime,
                event: this.eventTime,
            }
            cc.sys.localStorage.setItem(this.ItemKey, JSON.stringify(data));
        }
        this.isChange = false;
    }

    public IsNewMonth() {
        if (this.baseMonth != this.currentMonth) {
            this.baseMonth = this.currentMonth;
            this.isChange = true;
            return true;
        }
        return false;
    }

    /**新的一天*/
    public IsNewDay() {
        if (this.previousTime == 0 || Utility.IsTomorrow(this.previousTime)) {
            this.previousTime = Utility.TimeStamp();
            this.isChange = true;
            return true;
        }
        return false;
    }

    /**新的一周 */
    public IsNewWeek() {
        if (this.weekTime == 0 || Utility.TimeDifference(this.weekTime) >= 7) {
            let w = [6, 0, 1, 2, 3, 4, 5];
            let day = this.currDate.getDay();
            let mt = this.currDate.getTime() - w[day] * 24 * 3600 * 1000;
            this.weekTime = mt;
            this.isChange = true;
            return true;
        }

        return false;
    }

    public set EventTime(time: number) {
        this.eventTime = time;
        this.isChange = true;
    }

    public get EventTime() {
        return this.eventTime;
    }

    /**是否是润年 */
    private IsLeap(year: number) {
        return ((((year) % 4) == 0 && ((year) % 100) != 0) || ((year) % 400) == 0);
    }

    private get ItemKey() {
        return Consts.GameName + "_GameDate";
    }
}

