//此代码由配置工具生成 
using System.Collections.Generic;
namespace Config{
	[System.Serializable]
	public class EventTimeItem{
		/// <summary>
		/// 序号
		/// </summary>
		public int Id;
		/// <summary>
		/// 是否开启0=关闭 1=开启
		/// </summary>
		public int Isopen;
		/// <summary>
		/// 活动类型
		/// </summary>
		public int Type;
		/// <summary>
		/// 活动名称
		/// </summary>
		public string Name;
		/// <summary>
		/// 活动图片
		/// </summary>
		public string Icon;
		/// <summary>
		/// 开始时间
		/// </summary>
		public int Start;
		/// <summary>
		/// 结束时间
		/// </summary>
		public int End;
		/// <summary>
		/// 图片1
		/// </summary>
		public string Image1;
		/// <summary>
		/// 图片2
		/// </summary>
		public string Image2;
		/// <summary>
		/// 图片3
		/// </summary>
		public string Image3;
	}

	[System.Serializable]
	public class EventTime{
		public List<EventTimeItem> JsonList;
	}
}