using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatApp.Web.Models
{
	public enum MessageType
	{
		Text
	}
	public class Message
	{
		public AppUser Sender;
		public AppUser Receiver;
		private byte[] _message;
		private MessageType _msgType;
		public DateTime SendTimeStamp;
	}
}