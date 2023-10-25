//此代码由配置工具生成 
using System.Collections.Generic;
namespace Config{
	[System.Serializable]
	public class TaskItem{
		/// <summary>
		/// 序号
		/// </summary>
		public int ID;
		/// <summary>
		/// 关卡
		/// </summary>
		public int Level;
		/// <summary>
		/// 描述，这里仅做描述，功能块实际又代码控制
		/// </summary>
		public string Desc;
		/// <summary>
		/// 控制器
		/// </summary>
		public string Controller;
		/// <summary>
		/// 资源弹窗
		/// </summary>
		public string Fgui;
		/// <summary>
		/// 描述
		/// </summary>
		public string Desc_cn;
	}

	[System.Serializable]
	public class Task{
		public List<TaskItem> JsonList;
	}
}