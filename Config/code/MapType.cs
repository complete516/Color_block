//此代码由配置工具生成 
using System.Collections.Generic;
namespace Config{
	[System.Serializable]
	public class MapTypeItem{
		/// <summary>
		/// 序号和地图ID，对应工程编辑的顺序
		/// </summary>
		public int Id;
		/// <summary>
		/// 分组
		/// </summary>
		public int [] Type;
	}

	[System.Serializable]
	public class MapType{
		public List<MapTypeItem> JsonList;
	}
}