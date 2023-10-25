//此代码由配置工具生成 
using System.Collections.Generic;
namespace Config{
	[System.Serializable]
	public class Difficulty2Item{
		/// <summary>
		/// 序号
		/// </summary>
		public int Id;
		/// <summary>
		/// 分数
		/// </summary>
		public int Score;
		/// <summary>
		/// 类型1
		/// </summary>
		public int [] Type;
	}

	[System.Serializable]
	public class Difficulty2{
		public List<Difficulty2Item> JsonList;
	}
}