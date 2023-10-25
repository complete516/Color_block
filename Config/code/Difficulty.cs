//此代码由配置工具生成 
using System.Collections.Generic;
namespace Config{
	[System.Serializable]
	public class DifficultyItem{
		/// <summary>
		/// 序号
		/// </summary>
		public int Id;
		/// <summary>
		/// 失败次数，小于等于
		/// </summary>
		public int FaildNum;
		/// <summary>
		/// 类型1
		/// </summary>
		public int [] Type;
	}

	[System.Serializable]
	public class Difficulty{
		public List<DifficultyItem> JsonList;
	}
}