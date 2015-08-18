using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatApp.Web.Models.Chat
{
	public class Message
	{
		public string Sender { get; set; }
		public string Timestamp { get; set; }
		public string MessageContent { get; set; }
	}
}