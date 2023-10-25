import Consts from "../../Consts/Consts";
import { TileColor } from "../../Consts/Define";
import EliminateEffect from "../../Effect/EliminateEffect";
import RectangleEffect from "../../Effect/RectangleEffect";
import ResMgr from "../../Framework/ResMgr";
import Game from "../../Game";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Tile extends cc.Component {

    private background: cc.Sprite = null;
    private tileColor: TileColor = TileColor.None;

    private location: cc.Vec2 = cc.Vec2.ZERO;
    private countText: cc.Label = null;
    private count: number = 0;
    private effectNode: cc.Node = null;
    private fontSpr: cc.Sprite = null;

    @property(cc.SpriteFrame)
    private sfList: cc.SpriteFrame[] = [];

    @property(cc.Material)
    private mat: cc.Material[] = [];

    private isAction: boolean = false;
    private animNode: cc.Node = null;

    private isFriendly: boolean = false;

    protected onLoad(): void {
        this.background = this.node.getChildByName("Image").getComponent(cc.Sprite);
        this.countText = this.node.getChildByName("CountText").getComponent(cc.Label);
        this.effectNode = this.node.getChildByName("Effect");
        this.fontSpr = this.node.getChildByName("FontText").getComponent(cc.Sprite);
    }


    public SetData(data: { tileColor: TileColor, spriteFrame: string, fontColor: cc.Color }, count: number = 0) {
        this.tileColor = data.tileColor;
        
        ResMgr.Instance.GetRes<cc.SpriteFrame>(data.spriteFrame, (res) => {
            if(this.background == null){
                cc.log(data.spriteFrame);
            }
            this.background.spriteFrame = res;
        });
        this.count = count;
        this.RefreshCountText();
        this.fontSpr.node.color = data.fontColor;
        this.isAction = false;
        this.node.opacity = 255;
        cc.Tween.stopAllByTarget(this.node);
    }

    public set Location(value: cc.Vec2) {
        this.location = value;
    }

    public get Location() {
        return this.location;
    }

    public get TileColor() {
        return this.tileColor;
    }

    public set Count(value: number) {
        this.count = value;
    }

    public get Count() {
        return this.count;
    }

    public RefreshCountText() {
        // this.countText.string = this.count <= 1 ? "" : this.count.toString();
        this.fontSpr.node.active = false;
        if (this.count > 1) {
            this.fontSpr.spriteFrame = this.sfList[this.count - 1];
            this.fontSpr.node.active = true;
        }
    }

    public Action(data: { tileColor: TileColor, spriteFrame: string, fontColor: cc.Color }, dy: number, isRectangle: boolean = false) {
        if (isRectangle) {
            // let anim = Game.Instance.EffectPool.Pop(Consts.ResName.RectangleEffect);
            // let r = anim.getComponent(RectangleEffect);
            // anim.position = cc.v3(0, -80);
            // anim.setScale(0.6);
            // this.node.addChild(anim);
            // r.Play(this.tileColor);
            this.PlayRectangleEffect(false);
            // cc.log("ActionAction")
        }

        let node = new cc.Node();
        let spr = node.addComponent(cc.Sprite);
        spr.spriteFrame = this.background.spriteFrame;
        node.scale = this.background.node.scale;
        this.node.addChild(node);

        this.SetData(data);
        cc.tween(node).delay(dy).to(0.3, { scale: 0, opacity: 20 }).call(() => {
            node.destroy();
        }).start();

        let effectNode = Game.Instance.EffectPool.Pop(Consts.ResName.EliminateEffect);
        let effect = effectNode.getComponent(EliminateEffect);
        this.node.addChild(effectNode);
        effect.Play();
    }

    public set Gray(value: boolean) {
        if (value == true) {
            this.background.setMaterial(0, this.mat[1]);
        } else {
            this.background.setMaterial(0, this.mat[0]);
        }
    }

    /**闪动 */
    public Twinkle() {
        this.isAction = true;
        this.PlayRectangleEffect(true);
    }


    /**取消闪动 */
    public StopTwinkle() {
        if (this.isAction && this.animNode) {
            this.animNode.getComponent(RectangleEffect).StopAnim();
        }
    }

    /**矩形特效*/
    private PlayRectangleEffect(isLoop: boolean) {
        if (this.animNode != null) {
            this.animNode.getComponent(RectangleEffect).Play(this.tileColor, isLoop);
        } else {
            let anim = Game.Instance.EffectPool.Pop(Consts.ResName.RectangleEffect);
            let r = anim.getComponent(RectangleEffect);
            let p = this.node.position;
            anim.position = cc.v3(p.x, p.y - 90);//cc.v3(0, -80);
            anim.setScale(0.7);
            // this.node.addChild(anim);
            this.node.parent.addChild(anim);
            this.animNode = anim;
            r.Play(this.tileColor, isLoop);
            r.Callback = () => {
                this.animNode = null;
            }
        }
        return this.animNode;
    }


    public FriendlyAction() {
        this.node.opacity = 255;
        cc.tween(this.node).to(1, { opacity: 128 }, { easing: "smooth" })
            .to(1, { opacity: 255 }, { easing: "smooth" })
            .union()
            .repeatForever().start();
        this.isFriendly = true;
    }

    public StopFriendlyAction() {
        this.isFriendly = false;
        // this.node.opacity = 255;
        cc.Tween.stopAllByTarget(this.node);
    }

    /**是否 */
    public get IsFriendly() {
        return this.isFriendly;
    }
}
