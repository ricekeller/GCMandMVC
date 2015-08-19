using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace ChatApp.Web.Models.Chat
{
	public class ClientInfo
	{
		public string DisplayName { get; set; }
		public StreamWriter StreamWriter { get; set; }

	}
}