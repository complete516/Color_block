//此代码由配置工具生成 
using System.Collections.Generic;
namespace Config{
	[System.Serializable]
	public class ColorRollLevelItem{
		/// <summary>
		/// 游戏关卡
		/// </summary>
		public int ID;
		/// <summary>
		/// 工程用管卡Id
		/// </summary>
		public int JsonID;
	}

	[System.Serializable]
	public class ColorRollLevel{
		public List<ColorRollLevelItem> JsonList;
	}
}