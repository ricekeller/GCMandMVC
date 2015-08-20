using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatApp.Web.Models.ViewModels
{
	public class CreateChatroomViewModel
	{
		public bool IsPrivate { get; set; }
		public string Password { get; set; }
	}
}