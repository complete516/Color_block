//此代码由配置工具生成 
using System.Collections.Generic;
namespace Config{
	[System.Serializable]
	public class JigsawLevelItem{
		/// <summary>
		/// 游戏关卡
		/// </summary>
		public int ID;
		/// <summary>
		/// 类型
		/// </summary>
		public int Type;
		/// <summary>
		/// 工程用PluzzleMap
		/// </summary>
		public int JsonID;
		/// <summary>
		/// 边框
		/// </summary>
		public string Bk;
	}

	[System.Serializable]
	public class JigsawLevel{
		public List<JigsawLevelItem> JsonList;
	}
}