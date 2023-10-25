// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Consts from "../scripts/Consts/Consts";
import Utility from "../scripts/Utility";
import ToolChessBoar from "./ToolChessBoar";

export enum MapType {
    Normal,
    Daily,
    Event,
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class CreateMap extends cc.Component {

    private btn: cc.Button = null;

    // @property({ tooltip: "生成多少个月的地图", type: cc.Integer })
    private month: number = 12;

    @property({ tooltip: "地图类型，每日挑战，事件模式", type: cc.Enum(MapType) })
    private mapType: MapType = MapType.Daily;

    @property(cc.JsonAsset)
    private mapConfig: cc.JsonAsset = null;
    @property(cc.JsonAsset)
    private terrainConfig: cc.JsonAsset = null;

    @property(cc.JsonAsset)
    private mapTypeConfig: cc.JsonAsset = null;

    @property(cc.Integer)
    private dailyMaxScore: number = 700;
    @property(cc.Integer)
    private dailyMinScore: number = 400
    @property({ tooltip: "块type最小值", type: cc.Integer })
    private tileMinType: number = 1;
    @property({ tooltip: "块type最大值", type: cc.Integer })
    private tileMaxType: number = 5;




    private mapTypeData: { Id: number, Type: number[] }[] = [];
    private mapData: number[][] = [];
    private terrainData: number[][] = [];
    private mapTypeDict: Map<number, { Id: number, Type: number[] }[]> = new Map<number, { Id: number, Type: number[] }[]>();

    private chesstool: ToolChessBoar = null;

    protected onLoad(): void {
        this.btn = this.node.getComponent(cc.Button);
    }

    start() {
        this.chesstool = this.node.parent.getChildByName("Chessboar").getComponent(ToolChessBoar);
        this.btn.node.on("click", this.OnClickCreateMap.bind(this));
        let obj = this.mapTypeConfig.json;
        let keys = Object.keys(obj);


        for (let i = 0; i < keys.length; i++) {
            let data = obj[keys[i]];

            for (let tt = 1; tt <= 5; tt++) {

                this.mapTypeData.push({ Id: data.Id, Type: data.Type });
            }

            let tList = data.Type
            for (let ix of tList) {
                if (!this.mapTypeDict.has(ix)) {
                    this.mapTypeDict.set(ix, []);
                }
                this.mapTypeDict.get(ix).push({ Id: data.Id, Type: data.Type });
            }
        }

        let j = this.mapConfig.json;
        let mo = j.matrix;
        keys = Object.keys(mo);
        for (let i = 0; i < keys.length; i++) {
            let data = mo[keys[i]];
            this.mapData.push(data);
        }

        let t = this.terrainConfig.json;
        let to = t.matrix;
        keys = Object.keys(to);
        for (let i = 0; i < keys.length; i++) {
            this.terrainData.push(to[keys[i]]);
        }

        cc.log(this.mapTypeDict);
    }

    /**点击创建地图*/
    private OnClickCreateMap() {
        if (this.mapType == MapType.Daily) {
            this.CreateDailyMap();
        } else if (this.mapType == MapType.Event) {
            this.CreateEventMap();
        }
    }

    /**生成每日挑战地图 */
    private CreateDailyMap() {
        let date = Utility.TimeFormat(Utility.TimeStamp());
        let isLeap = Utility.IsLeap(date.getFullYear());
        let index = isLeap ? 0 : 1;
        let min = Math.floor(this.dailyMinScore / 100);
        let max = Math.floor(this.dailyMaxScore / 100);
        let typeList = this.mapTypeDict.get(2);
        let yearList: { MapIndex: number, TerIndex: number, Score: number, TypeCount: { [key: number]: number } }[][] = [];


        for (let i = 0; i < this.month; i++) {
            let days = Consts.MonthDays[index][i];
            let t: number[] = [];
            yearList[i] = [];
            for (let ix = 0; ix < days; ix++) {
                let score = Utility.RandomRangeInt(min, max);
                let mapIndex = Utility.RandomRangeInt(0, typeList.length - 1);
                let mId = typeList[mapIndex].Id - 1;
                let tId = this.RandomTerrain(t, 0, this.terrainData.length);
                let typeCount: { [key: number]: number } = {};
                for (let tt = this.tileMinType; tt <= this.tileMaxType; tt++) {
                    let count = Utility.RandomRangeInt(1, 3);
                    typeCount[tt] = count;
                }

                let obj = { MapIndex: mId, TerIndex: tId, Score: score * 100, TypeCount: typeCount };
                t.push(tId);
                yearList[i].push(obj);
            }
        }

        if (cc.sys.isNative) {
            let jsonName = "DailyDataConfig.json";
            let content = "{\n\t";
            for (let i = 0; i < yearList.length; i++) {
                content += `"${i + 1}":[\n\t\t`
                let data = yearList[i];
                for (let ix = 0; ix < data.length; ix++) {
                    let keys = Object.keys(data[ix]);
                    content += "{"
                    for (let ii = 0; ii < keys.length; ii++) {
                        let key = keys[ii];
                        let value = data[ix][key];
                        if (typeof (value) == "object") {
                            value = JSON.stringify(value);
                        }
                        content += `"${key}":` + `${value}` + ((ii < keys.length - 1) ? "," : "");
                    }
                    content += "}" + ((ix < data.length - 1) ? ",\n\t\t" : "\n\t");
                }
                content += "]" + ((i < yearList.length - 1) ? ",\n" : "\n");
            }
            content += "}";

            jsb.fileUtils.writeStringToFile(content, this.chesstool.jsonFilePath + "/" + jsonName);
        }
    }





    /**随机不重复的ID*/
    private RandomTerrain(arr: number[], min: number, max: number) {
        while (true) {
            let index = Utility.RandomRangeInt(min, max - 1);
            if (arr.indexOf(index) == -1) {
                return index;
            }
        }
    }

    private CreateEventMap() {

        let scoreList = [[500, 550], [600, 700], [800, 900]]
        let itmeList: { [key: string]: number }[][] = [
            [{ Item1: 6 }, { Item2: 6 }, { Item3: 4 }],
            [{ Item1: 8 }, { Item2: 8 }, { Item3: 9 }],
            [{ Item1: 8 }, { Item2: 12 }, { Item3: 16 }],
        ]

        let typeList = this.mapTypeDict.get(3);
        cc.log(typeList)
        // let arr = [4 * 4, 5 * 5, 6 * 6];
        let eventList: { Name: string, MapIndex: number, TerIndex: number, Score: number, TypeCount: { [key: number]: number } }[][] = [];

        for (let i = 0; i < itmeList.length; i++) {
            let t: number[] = [];
            eventList[i] = [];
            let arr = itmeList[i];
            for (let j = 0; j < arr.length; j++) {
                let scoreArr = scoreList[j];
                let value = arr[j];
                let key = Object.keys(value)[0];
                let count = value[key];

                for (let jj = 0; jj < count; jj++) {
                    let score = scoreArr[Utility.RandomRangeInt(0, 1)];
                    let mapIndex = Utility.RandomRangeInt(0, typeList.length - 1);
                    let mId = typeList[mapIndex].Id - 1;
                    let tId = this.RandomTerrain(t, 0, this.terrainData.length);

                    let typeCount: { [key: number]: number } = {};
                    for (let tt = this.tileMinType; tt <= this.tileMaxType; tt++) {
                        if (key == "Item1") {
                            typeCount[tt] = 1;
                        } else if (key == "Item2") {
                            typeCount[tt] = 2;
                        } else {
                            typeCount[tt] = 3;
                        }
                    }
                    let obj = { MapIndex: mId, TerIndex: tId, Score: score, TypeCount: typeCount, Name: key + `_${jj + 1}` };
                    eventList[i].push(obj);
                    t.push(tId);
                }
            }
        }


        if (cc.sys.isNative) {
            let jsonName = "EventDataConfig.json";
            let content = "{\n\t";
            for (let i = 0; i < eventList.length; i++) {
                content += `"${i + 1}":[\n\t\t`
                let data = eventList[i];
                for (let ix = 0; ix < data.length; ix++) {
                    let keys = Object.keys(data[ix]);
                    content += "{"
                    for (let ii = 0; ii < keys.length; ii++) {
                        let key = keys[ii];
                        let value = data[ix][key];

                        if (typeof (value) == "object") {
                            value = JSON.stringify(value);
                        } else if (typeof (value) == 'string') {
                            value = `"${value}"`;
                        }

                        content += `"${key}":` + `${value}` + ((ii < keys.length - 1) ? "," : "");
                    }
                    content += "}" + ((ix < data.length - 1) ? ",\n\t\t" : "\n\t");
                }
                content += "]" + ((i < eventList.length - 1) ? ",\n" : "\n");
            }
            content += "}";

            jsb.fileUtils.writeStringToFile(content, this.chesstool.jsonFilePath + "/" + jsonName);
        }

    }



}
