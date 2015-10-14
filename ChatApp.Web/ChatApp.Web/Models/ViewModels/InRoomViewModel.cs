using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ChatApp.Web.Models.Chat;

namespace ChatApp.Web.Models.ViewModels
{
	public class InRoomViewModel
	{
		public List<Chatroom> Chatrooms { get; set; }
		public string CurrentRoomId { get; set; }
	}
}