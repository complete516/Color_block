//此代码由配置工具生成 
using System.Collections.Generic;
namespace Config{
	[System.Serializable]
	public class GameSkinConfigItem{
		/// <summary>
		/// 序号
		/// </summary>
		public int Id;
		/// <summary>
		/// 类型1=默认 2=金币 3=视频
		/// </summary>
		public int Type;
		/// <summary>
		/// 所需要的数值
		/// </summary>
		public int Need;
		/// <summary>
		/// 皮肤界面Icom
		/// </summary>
		public string SkinIcon;
		/// <summary>
		/// 皮肤组
		/// </summary>
		public string Skin;
		/// <summary>
		/// 方块1颜色，第一个值为方块上面的数字，第二个值为矩形提示圈
		/// </summary>
		public string Cube1;
		/// <summary>
		/// 方块2
		/// </summary>
		public string Cube2;
		/// <summary>
		/// 方块3
		/// </summary>
		public string Cube3;
	}

	[System.Serializable]
	public class GameSkinConfig{
		public List<GameSkinConfigItem> JsonList;
	}
}