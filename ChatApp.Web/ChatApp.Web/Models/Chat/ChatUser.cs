using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatApp.Web.Models.Chat
{
	public class ChatUser
	{
		public string DisplayName { get; set; }
		public string ID { get; set; }

		public static ChatUser GetUserById(string uId)
		{
			//TODO: implement real functionality
			return new ChatUser();
		}
	}
}