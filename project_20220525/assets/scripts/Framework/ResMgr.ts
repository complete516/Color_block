import Utility from "../Utility";
import { AssetType, ResData, ResMap } from "../ResConfig";

/**资源加载器 */
export default class ResMgr {
    private resMap: Map<string, cc.Asset> = new Map<string, cc.Asset>();
    /**fgui包*/
    private pkgMap: Map<string, fgui.UIPackage> = new Map<string, fgui.UIPackage>();
    /**bundle*/
    private bundleMap: Map<string, cc.AssetManager.Bundle> = new Map<string, cc.AssetManager.Bundle>();
    /**总共需要加载的资源数*/
    private totalResNum: number = 0;
    /**加载完成资源数*/
    private loadCompleteResNum: number = 0;
    /**每帧最大加载资源数*/
    public maxFrameLoadNum: number = 5;
    /**当前帧加载数 */
    private currFrameLoadNum: number = 0;
    private static instance: ResMgr = null;

    public static get Instance() {
        if (ResMgr.instance == null) {
            ResMgr.instance = new ResMgr();
        }
        return ResMgr.instance;
    }

    /**
     * 加载资源
     * @param progressCB 进度回调 0-1
     * @param completeCB 加载完成回调
     */
    public LoadAllRes(progressCB?: (progress: number) => void, completeCB?: () => void) {
        ResMap.Init();
        let resList = ResMap.FirstResList;
        this.totalResNum = resList.length;
        for (let i = 0; i < resList.length; i++) {
            this.LoadRes(resList[i], () => {
                this.loadCompleteResNum++;
                if (progressCB) progressCB(this.loadCompleteResNum / this.totalResNum);
                if (this.loadCompleteResNum >= this.totalResNum) {
                    completeCB && completeCB();
                }
            });
        }
    }

    /**每帧加载资源*/
    public FrameLoadRes() {
        if (this.currFrameLoadNum >= ResMap.FrameResList.length) {
            return;
        }

        let frameList = ResMap.FrameResList;
        for (let i = this.currFrameLoadNum; i < this.currFrameLoadNum + this.maxFrameLoadNum; i++) {
            this.LoadRes(frameList[i])
        }
        this.currFrameLoadNum += this.maxFrameLoadNum;
    }

    /**加载资源 */
    private LoadRes(resName: string, callback?: Function) {
        let info = ResMap.ResConfigMap.get(resName);
        let bundleName = info.bundleName;

        if (info.fGUIPackName != "") {
            this.LoadFGUIPkg(info, callback);
            return;
        }

        if (info.isDirectory) {
            cc.resources.loadDir(info.path, (err, assets: cc.Asset[]) => {
                if (err) {
                    cc.log(err.message);
                    return;
                }
                for (let item of assets) {
                    this.resMap.set(item.name, item);
                }

                callback && callback();
            });
            return;
        }


        if (bundleName == "") {
            this.LoadResourcesRes(info, (res: cc.Asset) => {
                if (callback) callback(res)
            })
        } else {
            if (this.bundleMap.has(bundleName)) {
                this.LoadBundleRes(info, (res: cc.Asset) => {
                    if (callback) callback(res)
                });
            } else {
                cc.assetManager.loadBundle(bundleName, (err, bundle: cc.AssetManager.Bundle) => {
                    if (err) {
                        cc.error(err.message);
                        return;
                    }
                    this.bundleMap.set(bundleName, bundle);
                    this.LoadRes(resName, callback);
                });
            }
        }
    }

    public LoadFGUIPackage(resName: string, callback: () => void) {
        let resData = ResMap.ResConfigMap.get(resName);
        this.LoadFGUIPkg(resData, callback);
    }


    /**加载FGUI的包 */
    private LoadFGUIPkg(info: ResData, callback: Function) {
        let bundleName = info.bundleName;
        let resName = info.resName;

        if (this.pkgMap.has(info.fGUIPackName)) {
            callback && callback();
            return;
        }

        if (bundleName == "") {
            fgui.UIPackage.loadPackage(Utility.JoinPath(info.path, info.fGUIPackName), (err, pkg) => {
                this.LoadPackageCallback(info, err, pkg, callback);
            });
        } else {
            cc.assetManager.loadBundle(bundleName, (err, bundle) => {
                if (err) {
                    cc.error(err.message);
                    return;
                }
                this.bundleMap.set(bundleName, bundle);
                fgui.UIPackage.loadPackage(bundle, Utility.JoinPath(info.path, info.fGUIPackName), (err, pkg) => {
                    this.LoadPackageCallback(info, err, pkg, callback);
                })
            });
        }
    }

    /**加载包回调*/
    private LoadPackageCallback(info: ResData, err: any, pkg: fgui.UIPackage, callback: Function) {
        if (err) {
            cc.error(err);
            return;
        }
        if (!this.pkgMap.has(info.fGUIPackName)) {
            this.pkgMap.set(info.fGUIPackName, pkg);
        }
        fgui.UIPackage.addPackage(Utility.JoinPath(info.path, info.fGUIPackName));
        callback && callback();
    }

    /**加载bundle资源*/
    private LoadBundleRes(info: ResData, callback?: Function) {

        let fullPath = Utility.JoinPath(info.path, info.resName);
        this.bundleMap.get(info.bundleName).load(fullPath, this.GetResType(info.type), (err, res) => {
            if (err) {
                cc.warn(err.message);
                return;
            }
            this.resMap.set(info.resName, res);
            if (callback) callback(res);
        })
    }

    /**加载resources下的资源 */
    private LoadResourcesRes(info: ResData, callback?: Function) {
        cc.resources.load(info.fullPath, this.GetResType(info.type), (err, res) => {
            if (err) {
                cc.log(err.message);
                return;
            }
            this.resMap.set(info.resName, res);
            if (callback) callback(res);
        })
    }

    /**
     * 获取资源
     * @param resName 资源名称
     * @param callback  回调
     * @returns isLoad:是否已加载 res:资源
     */
    public GetRes<T extends cc.Asset>(resName: string, callback?: (res: T) => void): { isLoad: boolean, res: T } {
        if (!this.resMap.has(resName)) {
            this.LoadRes(resName, (res: cc.Asset) => {
                if (callback) callback(res as T);
            })
            return { isLoad: false, res: null };
        } else {
            if (callback) callback(this.resMap.get(resName) as T);
            return { isLoad: true, res: this.resMap.get(resName) as T };
        }
    }

    public LoadAsset<T extends cc.Asset>(resName: string, rt: typeof cc.Asset & { prototype: T }, c: (res: T) => void) {
        if (this.resMap.has(resName)) {
            c(this.resMap.get(resName) as T);
            return;
        }

        let info = ResMap.resConfigMap.get(resName);
        if (info.bundleName != "") {
            if (!this.bundleMap.has(info.bundleName)) {
                cc.assetManager.loadBundle(info.bundleName, (err, bundle) => {
                    if (err) {
                        cc.error(err.message);
                        return;
                    }
                    this.bundleMap.set(info.bundleName, bundle);
                    this.LoadBundleRes(info, c);
                });
            } else {
                this.LoadBundleRes(info, c);
            }
        } else {
            cc.resources.load(Utility.JoinPath(info.path, info.resName), rt, (err, res: T) => {
                if (err) {
                    cc.error(err.message);
                    return;
                }
                c(res);
            });
        }
    }



    public LoadOtherRes<T extends cc.Asset>(bundleName: string, path: string, resName: string, rt: typeof cc.Asset & { prototype: T }, callback: (res: T) => void) {
        if (this.resMap.has(resName)) {
            callback && callback(this.resMap.get(resName) as T);
            return;
        }

        let fullPath = Utility.JoinPath(path, resName);
        if (bundleName == "") {
            cc.resources.load(fullPath, rt, (err, res: T) => {
                if (err) {
                    cc.error(err);
                    return;
                }
                this.resMap.set(resName, res);
                callback && callback(res as T);
            })
        } else {
            let loadBundle = (bundle: cc.AssetManager.Bundle) => {
                bundle.load(fullPath, rt, (err, res: T) => {
                    if (err) {
                        cc.error(err);
                        return;
                    }
                    this.resMap.set(resName, res);
                    callback && callback(res as T);
                })
            }

            if (this.bundleMap.has(bundleName)) {
                let bundle = this.bundleMap.get(bundleName);
                loadBundle(bundle);
            } else {
                cc.assetManager.loadBundle(bundleName, (err, bundle) => {
                    if (err) {
                        cc.error(err);
                        return;
                    }
                    this.bundleMap.set(bundleName, bundle);
                    loadBundle(bundle);
                })
            }
        }
    }

    public GetConfig(jsonName: string) {
        return (this.resMap.get(jsonName) as cc.JsonAsset).json;
    }


    /**删除资源 */
    public Release(resName: string) {
        if (this.resMap.has(resName)) {
            this.resMap.delete(resName);
            let info = ResMap.ResConfigMap.get(resName);
            if (info.resName == resName) {
                if (info.bundleName == "") {
                    cc.resources.release(info.fullPath);
                } else {
                    this.bundleMap.get(info.bundleName).release(info.fullPath);
                }
            }
        }
    }

    /**获取资源类型 */
    private GetResType(resType: number) {
        if (resType == AssetType.Prefab) {
            return cc.Prefab;
        } else if (resType == AssetType.Audio) {
            return cc.AudioClip;
        } else if (resType == AssetType.Font) {
            return cc.Font;
        } else if (resType == AssetType.SpriteFrame) {
            return cc.SpriteFrame;
        } else if (resType == AssetType.SpriteAtlas) {
            return cc.SpriteAtlas;
        } else if (resType == AssetType.Json) {
            return cc.JsonAsset;
        } else if (resType == AssetType.Spine) {
            return sp.SkeletonData;
        } else if (resType == AssetType.Material) {
            return cc.Material;
        }
        return cc.Prefab;
    }

    public get ResMap() {
        return this.resMap;
    }

}   