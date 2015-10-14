using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatApp.Web.Models.Chat
{
	public class JsonResponse<T>
	{
		public int Code { get; set; }
		public bool Success { get; set; }
		public T Data { get; set; }
	}
}