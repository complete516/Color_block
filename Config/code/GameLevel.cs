//此代码由配置工具生成 
using System.Collections.Generic;
namespace Config{
	[System.Serializable]
	public class GameLevelItem{
		/// <summary>
		/// 游戏关卡
		/// </summary>
		public int ID;
		/// <summary>
		/// 分数
		/// </summary>
		public int Score;
		/// <summary>
		/// 地图Index
		/// </summary>
		public int MapIndex;
		/// <summary>
		/// 地块
		/// </summary>
		public int TerrainIndex;
		/// <summary>
		/// 选择块
		/// </summary>
		public int [] SelectBlockList;
		/// <summary>
		/// 颜色数量
		/// </summary>
		public int ColorNum;
		/// <summary>
		/// 可随机方块预制
		/// </summary>
		public int [] BlockType;
		/// <summary>
		/// 操作反馈
		/// </summary>
		public string [] Feedback;
		/// <summary>
		/// 结束反馈
		/// </summary>
		public string Endingfeedback;
		/// <summary>
		/// 方块位置
		/// </summary>
		public int [] BlockLocation;
		/// <summary>
		/// 中文
		/// </summary>
		public string [] Feedback_cn;
		/// <summary>
		/// 
		/// </summary>
		public string Endingfeedback_cn;
	}

	[System.Serializable]
	public class GameLevel{
		public List<GameLevelItem> JsonList;
	}
}