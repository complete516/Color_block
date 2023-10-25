//此代码由配置工具生成 
using System.Collections.Generic;
namespace Config{
	[System.Serializable]
	public class BlockTypeItem{
		/// <summary>
		/// 序号和块ID，对应工程编辑的顺序
		/// </summary>
		public int Id;
		/// <summary>
		/// 分组
		/// </summary>
		public int Type;
	}

	[System.Serializable]
	public class BlockType{
		public List<BlockTypeItem> JsonList;
	}
}