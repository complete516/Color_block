
// import ResMgr from "../Mgr/ResMgr";
import { ResMap } from "../ResConfig";
import ResMgr from "./ResMgr";
import BaseUIForm from "./UIForm";
import { UIFormShowMode, UIFormType } from "./UIFormDefine";

const { ccclass, property } = cc._decorator;

@ccclass

export class UIManger extends cc.Component {
    private static instance: UIManger = null;
    /**窗口堆栈，可以一个一个的关闭*/
    private formsStack: Array<BaseUIForm> = new Array<BaseUIForm>();
    /**窗口缓存*/
    private allUIForms: Map<string, BaseUIForm> = new Map<string, BaseUIForm>();
    /**ui根节点 */
    private uiRoot: cc.Node = null;
    /**普通窗口的父节点 */
    private normalFormsParent: cc.Node = null;
    /**固定窗口 */
    private fixedFormsParent: cc.Node = null;
    /**弹窗 */
    private popUpFormsParent: cc.Node = null;
    /**遮罩节点 */
    private maskNode: cc.Node = null;

    /**当前显示的窗口*/
    private currentShowForms: Map<string, BaseUIForm> = new Map<string, BaseUIForm>()

    /**当前显示窗口栈 */
    private showFormStack: Array<BaseUIForm> = new Array<BaseUIForm>();

    private dispatchData: Map<string, any> = new Map<string, any>();

    /**正在加载窗口列表，防止反复加载*/
    private loadingUIForms: Map<string, boolean> = new Map<string, boolean>();

    public static get Instance(): UIManger {
        return UIManger.instance;
    }

    onLoad() {
        UIManger.instance = this;
        this.uiRoot = this.node;
        this.normalFormsParent = this.uiRoot.getChildByName("normalForms");
        this.fixedFormsParent = this.uiRoot.getChildByName("fixedForms");
        this.popUpFormsParent = this.uiRoot.getChildByName("popUpForms");
        this.maskNode = this.uiRoot.getChildByName("Mask");
    }

    /**显示窗口
     * @param uiFormName 窗口名称
     */
    public ShowUIForms(uiFormName: string) {
        if (!this.allUIForms.has(uiFormName)) {
            this.LoadUIForms(uiFormName);
        } else {
            this.FormClassify(uiFormName);
        }
    }

    /**关闭窗口 */
    public CloseUIForms(uiFormName: string) {
        let uiForm = this.allUIForms.get(uiFormName);
        if (!uiForm) {
            cc.log(`缓存中不存在:${uiFormName} CloseUIForms`)
            return;
        }

        switch (uiForm.FormShowMode) {
            case UIFormShowMode.Normal:
                this.ExitNormalForms(uiFormName);
                break;
            case UIFormShowMode.ReverseChange:
                this.PopUIForms();
                break;
            case UIFormShowMode.HideOther:
                this.ExitHideOtherForms(uiFormName);
                break;
        }
    }

    /**加载UI*/
    private LoadUIForms(uiFormName: string) {
        if (this.loadingUIForms.get(uiFormName)) {
            cc.log(`${uiFormName}窗口正在加载...`);
            return;
        }

        ResMgr.Instance.GetRes<cc.Prefab>(uiFormName, (res) => {
            let node: cc.Node = cc.instantiate(res);
            let uiForm = node.getComponent(BaseUIForm);
            if (uiForm != null) {
                if (this.dispatchData.has(uiFormName)) {
                    uiForm.data = this.dispatchData.get(uiFormName);
                    this.dispatchData.delete(uiFormName);
                }

                switch (uiForm.FormType) {
                    case UIFormType.Normal:
                        uiForm.node.setParent(this.normalFormsParent);
                        break;
                    case UIFormType.Fixed:
                        uiForm.node.setParent(this.fixedFormsParent);
                        break;
                    case UIFormType.PopUp:
                        uiForm.node.setParent(this.popUpFormsParent);
                        break;
                }
                uiForm.node.position = cc.Vec3.ZERO;
                uiForm.node.active = false;
                /**添加防止穿透控件 */
                if (uiForm.getComponent(cc.BlockInputEvents)) {
                    uiForm.addComponent(cc.BlockInputEvents);
                }
                uiForm.SetData();
                this.allUIForms.set(uiFormName, uiForm);
                this.FormClassify(uiFormName);
            }

            this.loadingUIForms.set(uiFormName, true);
        });
    }

    /**窗口分类 */
    private FormClassify(uiFormName: string) {
        let uiForm = this.allUIForms.get(uiFormName);
        if (!uiForm) {
            cc.log(`缓存中不存在:${uiFormName} FormClassify`)
            return;
        }

        switch (uiForm.FormShowMode) {
            case UIFormShowMode.Normal:
                this.EnterNormalForms(uiFormName);
                break;
            case UIFormShowMode.ReverseChange:
                this.PushUIForms(uiFormName);
                break;
            case UIFormShowMode.HideOther:
                this.EnterHideOtherForms(uiFormName)
                break;
        }
    }

    private PushUIForms(uiFormName: string) {

        if (this.formsStack.length > 0) {
            let uiForm = this.formsStack[0];
            uiForm.Freeze();
        }

        let uiForm = this.allUIForms.get(uiFormName);
        if (!uiForm) {
            cc.log(`缓存中不存在:${uiFormName} PushUIForms`)
            return;
        }

        uiForm.Display();
        this.ShowMask(uiForm);
        this.formsStack.push(uiForm);
    }

    /**显示mask */
    private ShowMask(uiForm: BaseUIForm) {
        if (uiForm.isShowMask) {
            this.maskNode.removeFromParent();
            uiForm.node.addChild(this.maskNode);
            this.maskNode.active = true;
            this.maskNode.opacity = uiForm.MaskOpacity;
            this.maskNode.setSiblingIndex(0);
        }
    }

    /**弹出窗口 */
    private PopUIForms() {
        if (this.formsStack.length > 1) {
            let topForm = this.formsStack.pop();
            topForm?.Hiding();
            let nextForm = this.formsStack[this.formsStack.length - 1];
            nextForm.Redisplay();
        } else if (this.formsStack.length == 1) {
            let uiForm = this.formsStack.pop();
            uiForm?.Hiding();
        }
    }

    /**隐藏其他窗口 */
    private EnterHideOtherForms(uiFormName: string) {
        let uiForm = this.allUIForms.get(uiFormName);
        if (!uiForm) {
            cc.log(`缓存中不存在:${uiFormName} EnterHideOtherForms`)
            return;
        }

        this.currentShowForms.forEach((val, key) => val.Hiding());
        this.showFormStack.forEach((val, key) => val.Hiding);

        this.currentShowForms.set(uiFormName, uiForm);
        uiForm.Display();
        this.ShowMask(uiForm);
    }


    /**显示普通示窗口 */
    private EnterNormalForms(uiFormName: string) {
        let uiForm = this.allUIForms.get(uiFormName);
        if (!uiForm) {
            cc.log(`缓存中不存在:${uiFormName} EnterNormalForms`)
            return;
        }
        cc.log(uiFormName);
        this.currentShowForms.set(uiFormName, uiForm);
        uiForm.Display();
        this.ShowMask(uiForm);
        // this.showFormStack.push(uiForm);
    }

    /**退出普通窗口 */
    private ExitNormalForms(uiFormName: string) {
        let uiForm = this.currentShowForms.get(uiFormName);
        if (!uiForm) {
            cc.log(`缓存中不存在:${uiFormName} ExitNormalForms`);
            return;
        }

        this.showFormStack.pop();
        if (!uiForm.IsDestroy) {
            uiForm.Hiding();
        } else {
            this.maskNode.removeFromParent();
            uiForm.node.destroy();
            if (this.allUIForms.has(uiFormName)) {
                this.allUIForms.delete(uiFormName);
                this.loadingUIForms.delete(uiFormName);
            }

            let topForm = this.showFormStack[this.showFormStack.length - 1];
            if (topForm) {
                if (topForm.isShowMask) {
                    this.maskNode.active = true;
                    topForm.node.addChild(this.maskNode);
                    this.maskNode.setSiblingIndex(0);
                    this.maskNode.opacity = topForm.MaskOpacity;
                } else {
                    this.maskNode.active = false;
                    this.uiRoot.addChild(this.maskNode);
                }
            }

        }
        this.currentShowForms.delete(uiFormName);
    }

    /**退出隐藏窗口 */
    private ExitHideOtherForms(uiFormName: string) {
        let uiForm = this.currentShowForms.get(uiFormName);
        if (!uiForm) {
            cc.log(`缓存中不存在:${uiFormName} ExitHideOtherForms`);
            return;
        }

        uiForm.Hiding();
        this.currentShowForms.delete(uiFormName);
        this.showFormStack.pop();
        this.currentShowForms.forEach((val, key) => val.Redisplay());
        this.showFormStack.forEach((val, key) => val.Redisplay());
    }

    public SetFormsData(uiFormName: string, data: any) {
        //在缓存中就可以直接执行这个消息
        if (this.allUIForms.has(uiFormName)) {
            let uiForm = this.allUIForms.get(uiFormName);
            if (uiForm) {
                uiForm.data = data;
                uiForm.SetData();
            }
            return
        }
        this.dispatchData.set(uiFormName, data);
    }

    /**获取UI窗口 */
    public GetUIForms(uiFormName: string) {
        return this.allUIForms.get(uiFormName);
    }


    public IsFormsAllHide() {
        return this.currentShowForms.size == 0;
    }

    public IsFormsHide(viewName: string) {
        let view = this.currentShowForms.get(viewName);
        if (view && view.node.active) {
            return false;
        }
        return true;
    }

    public get NormalRoot() {
        return this.normalFormsParent;
    }

}