import Consts from "./Consts/Consts";
import { Platform } from "./Consts/Define";
import Game from "./Game";

export default class Utility {
    /**
     * 查找子节点
     * @param node 父节点
     * @param path 要查找的路径  ex:'node/fff'
     * @returns 找到的节点
     */
    public static FindChildByPath(node: cc.Node, path: string) {
        let names = path.split("/");
        // cc.log(names, "FindChildByPath", path)
        let target: cc.Node = node;
        if (names.length > 0) {
            for (let i = 0; i < names.length; i++) {
                if (target) {
                    target = target.getChildByName(names[i])
                }
            }
        } else {
            target = node.getChildByName(path);
        }
        return target;
    }

    /**格式化数字补零 */
    public static FormatZeroPad(nr: number, base: number = 10) {
        var len = (String(base).length - String(nr).length) + 1;
        return len > 0 ? new Array(len).join('0') + nr : nr;
    }

    /**金币转换 */
    public static Converter(money: number, fixed: number = 2) {
        let retain = function (num, decimal) {
            num = num.toString();
            let index = num.indexOf('.');
            if (index !== -1) {
                num = num.substring(0, decimal + index + 1)
            } else {
                num = num.substring(0)
            }

            let tempNum = parseFloat(num);
            if (Number.isInteger(tempNum)) {
                return tempNum.toString();
            }
            return tempNum.toFixed(decimal)
        }

        let arr = ["k", "m", "b", "t", "A", "B", "C", "D", "E", "F"];
        let k = 1000;
        let str = retain(money, fixed);

        if (money >= k) {
            let temp = money;
            let digits = 0;
            while (temp >= k) {
                temp = Math.floor(temp / k);
                digits++;
            }
            str = retain(money / Math.pow(k, digits), 2) + arr[digits - 1];
        } else {
            str = Math.floor(money).toString();
        }

        return str;
    }

    /**日期格式化 */
    public static TimeFormat(timstamp: number) {
        let date = new Date(timstamp);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    /**获取时间戳 */
    public static TimeStamp() {
        return (new Date()).valueOf();
    }

    /**限制值在最大最小之间*/
    public static Clamp(value: number, min: number, max: number) {
        return (value < min ? min : value) > max ? max : value;
    }

    /**
     * 随机一个整数 [min,max]
     * @param min 最小值
     * @param max 最大值
     * @returns 随机的整数
     */
    public static RandomRangeInt(min: number, max: number) {
        return Math.floor(Math.random() * (max + 1 - min) + min);
    }

    public static DebugLog(str: string) {
        // if (StaticConfig.platform == Platform.app_tradPlus) {
        if (Consts.GamePlatform == Platform.Android) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "DebugLog", "(Ljava/lang/String;)V", str);
        } else {
            // cc.log(str);
        }
        // }
    }

    /**数组随机，打乱数组 */
    public static ArrayRandValue(arr: any[]) {
        for (let i = 1; i < arr.length; i++) {
            const random = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[random]] = [arr[random], arr[i]];
        }
        return arr;
    }

    /**链接路径 */
    public static JoinPath(path: string, fileName: string) {
        return (path == "" ? "" : path + "/") + fileName;
    }

    /**手机震动 */
    public static PhoneVibrator() {

        if (Consts.GamePlatform == Platform.Android) {
            if (Game.Instance.Data.VibrateOff == 0) {
                let className = "org/cocos2dx/javascript/AppActivity";
                let methodName = "CallVibrate"
                let param = "()V";
                jsb.reflection.callStaticMethod(className, methodName, param);
            }
        }
    }

    /**调用安卓方法 */
    public static CallAndroidFunc(methodName: string, param: string = "") {
        let className = "org/cocos2dx/javascript/AppActivity"
        param = param == "" ? "()V" : param;
        jsb.reflection.callStaticMethod(className, methodName, param);
    }

    public static IsTomorrow(oldTime: number) {
        let currTime = Utility.TimeStamp();
        let lts = Utility.TimeFormat(oldTime).valueOf();
        let cts = Utility.TimeFormat(currTime).valueOf();
        let day = (cts - lts) / (1000 * 3600 * 24);
        return day >= 1;
    }

    /**获取时间差 */
    public static TimeDifference(oldTime: number) {
        let currTime = Utility.TimeStamp();
        let lts = Utility.TimeFormat(oldTime).valueOf();
        let cts = Utility.TimeFormat(currTime).valueOf();
        let day = (cts - lts) / (1000 * 3600 * 24);
        return day;
    }

    public static GetGaid() {
        if (Consts.GamePlatform == Platform.Android) {
            let className = "org/cocos2dx/javascript/AppActivity";
            let methodName = "GetUserId";
            let param = "()V";
            jsb.reflection.callStaticMethod(className, methodName, param);
        } else {
            let t = Utility.TimeStamp();
            window["SetGoogleAdvertId"]("test_" + t);
        }
    }



    /**是否是润年 */
    public static IsLeap(year: number) {
        return ((((year) % 4) == 0 && ((year) % 100) != 0) || ((year) % 400) == 0);
    }

    /**
     *  名字格式化
     */
    public static NameFormat(text: string) {
        if (text.length >= 20) {
            return text.substring(0, 17) + "...";
        }
        return text;
    }

    public static IsSignInGoogle(): boolean {
        if (Consts.GamePlatform == Platform.Android) {
            let className = "org/cocos2dx/javascript/AppActivity";
            let methodName = "IsSignIn";
            let param = "()Z";
            return jsb.reflection.callStaticMethod(className, methodName, param);
        }
        return false;
    }

    public static SignInGoogle() {
        if (Consts.GamePlatform == Platform.Android) {
            let className = "org/cocos2dx/javascript/AppActivity";
            let methodName = "SignIn";
            let param = "()V";
            return jsb.reflection.callStaticMethod(className, methodName, param);
        }
    }

    public static SignOutGoogle() {
        if (Consts.GamePlatform == Platform.Android) {
            let className = "org/cocos2dx/javascript/AppActivity";
            let methodName = "SignOut";
            let param = "()V";
            return jsb.reflection.callStaticMethod(className, methodName, param);
        }
    }

    public static GetAccountName() {
        Utility.DebugLog("GetAccountName");
        if (Consts.GamePlatform == Platform.Android) {
            let className = "org/cocos2dx/javascript/AppActivity";
            let methodName = "GetAccountDisplayName";
            let param = "()Ljava/lang/String;";
            return jsb.reflection.callStaticMethod(className, methodName, param);
        }
        return "";
    }

    public static GetAccountEmail() {
        if (Consts.GamePlatform == Platform.Android) {
            let className = "org/cocos2dx/javascript/AppActivity";
            let methodName = "GetAccountEmail";
            let param = "()Ljava/lang/String;";
            return jsb.reflection.callStaticMethod(className, methodName, param);
        }
        return "";
    }

    public static GetAccountId() {
        if (Consts.GamePlatform == Platform.Android) {
            let className = "org/cocos2dx/javascript/AppActivity";
            let methodName = "GetAccountId";
            let param = "()Ljava/lang/String;";
            return jsb.reflection.callStaticMethod(className, methodName, param);
        }
        return "";
    }
}
