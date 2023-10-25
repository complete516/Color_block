
// import GameCache from "../Data/GameCache";
import Game from "../Game";
import ResMgr from "./ResMgr";


export default class AudioMgr {
    private static instance: AudioMgr = null;
    private audioIDDict: Map<string, number> = new Map<string, number>();
    private currentMusic: cc.AudioClip = null;

    public static get Instance() {
        if (AudioMgr.instance == null) {
            AudioMgr.instance = new AudioMgr();
        }
        return AudioMgr.instance;
    }

    /**设置音效 */
    public SetEffectsVolume(volum: number) {
        cc.audioEngine.setEffectsVolume(volum);
    }

    /**设置音乐大小 */
    public SetMusicVolume(volum: number) {
        cc.audioEngine.setMusicVolume(volum);
    }

    /**音乐关闭 */
    public MusicOff() {
        cc.audioEngine.stopMusic();
    }

    /**音效关闭 */
    public EffectOff() {
        cc.audioEngine.stopAllEffects();
    }

    public OffEffect() {
        cc.audioEngine.stopAllEffects();
    }

    public OpenEffect() {
        cc.audioEngine.resumeAllEffects();
    }

    public OffMusic() {
        cc.audioEngine.pauseMusic();
    }

    public OpenMusic() {
        cc.audioEngine.resumeMusic();
        if (!cc.audioEngine.isMusicPlaying()) {
            if (this.currentMusic) {
                cc.audioEngine.playMusic(this.currentMusic, true);
            }
        }
    }


    public StopEffect(name: string) {
        if (this.audioIDDict.has(name)) {
            let audioID = this.audioIDDict.get(name);
            cc.audioEngine.stopEffect(audioID);
        }
    }

    public PauseAll() {
        cc.audioEngine.pauseAllEffects();
        cc.audioEngine.pauseMusic();
    }

    public ResumeAll() {
        cc.audioEngine.resumeAllEffects();
        cc.audioEngine.resumeMusic();
    }

    /**播放音效*/
    public PlayEffect(effectName: string, loop: boolean = false) {
        this.StopEffect(effectName);
        this.LoadAudionClip(effectName, true, loop);
    }

    /**播放音乐 */
    public PlayMusic(musicName: string, loop: boolean = true) {
        this.LoadAudionClip(musicName, false, loop);
    }



    private LoadAudionClip(name: string, isEffect: boolean, loop: boolean) {
        ResMgr.Instance.LoadAsset(name, cc.AudioClip, (res: cc.AudioClip) => {
            let audioID = 0xFFFFFFFFF;
            if (isEffect) {
                // if (GameCache.Instance.SettingData.sound == 0) {
                // cc.log(Game.Instance.Data.SoundOff)
                if (Game.Instance.Data.SoundOff == 0) {
                    audioID = cc.audioEngine.playEffect(res, loop);
                }
                // }
            } else {
                console.log("播放音乐", name);
                cc.audioEngine.stopMusic();
                this.currentMusic = res;
                // if (GameCache.Instance.SettingData.sound == 0) {
                if (Game.Instance.Data.SoundOff == 0) {
                    audioID = cc.audioEngine.playMusic(res, loop);
                }
                // }
            }
            if (audioID != 0xFFFFFFFFF) {
                this.audioIDDict.set(name, audioID);
            }
        });
    }

}