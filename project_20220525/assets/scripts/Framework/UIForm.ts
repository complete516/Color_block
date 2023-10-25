import { UIFormShowMode, UIFormType } from "./UIFormDefine";

const { ccclass, property } = cc._decorator;

/**
 * 需要重写 InitUI UI获取都是在此方法中实现
 * 
*/
@ccclass
export default abstract class BaseUIForm extends cc.Component {
    /**窗口类型 */
    public FormType: UIFormType = UIFormType.None;
    /**显示类型 */
    public FormShowMode: UIFormShowMode = UIFormShowMode.None;
    /**是否显示遮罩 */
    public isShowMask: boolean = true;
    /**透明度 默认255的一半*/
    public MaskOpacity: number = 128;
    /**是否删除 关闭之后界面删除*/
    public IsDestroy: boolean = false;

    public data: any = null;

    onLoad() {
        this.InitUI();
    }

    start() {
        this.InitEvent();
        this.Initialize();
    }


    /**显示 */
    public Display() {
        this.node.active = true;
        this.InitData();
    }

    /**隐藏 */
    public Hiding() {
        this.node.active = false;
    }

    /**重新显示 */
    public Redisplay() {
        this.node.active = true;
    }

    /**冻结 */
    public Freeze() {
        this.node.active = true;
    }

    public SetData() {

    }

    /**
     * 初始化UI
     * 需要重写
     */
    protected abstract InitUI();

    /**初始化数据  每次重新打开的时候 */
    protected InitData() {

    }
    /**初始化事件 */
    protected abstract InitEvent();

    /**初始化 */
    protected Initialize() { };


    /**点击按钮 */
    public AddClickBtnListener(btn: cc.Button, callback: Function) {
        if (!btn) return;
        btn.node.on("click", () => {
            callback && callback();
        });
    }

    public CloseSelf() {
        this.CloseView();
    }

    /**重写关闭界面之后的回调*/
    protected CloseView() {

    }

}