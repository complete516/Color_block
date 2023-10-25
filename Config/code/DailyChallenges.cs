//此代码由配置工具生成 
using System.Collections.Generic;
namespace Config{
	[System.Serializable]
	public class DailyChallengesItem{
		/// <summary>
		/// 序号
		/// </summary>
		public int Id;
		/// <summary>
		/// 时间
		/// </summary>
		public int Time;
		/// <summary>
		/// 图片资源
		/// </summary>
		public string Image;
	}

	[System.Serializable]
	public class DailyChallenges{
		public List<DailyChallengesItem> JsonList;
	}
}