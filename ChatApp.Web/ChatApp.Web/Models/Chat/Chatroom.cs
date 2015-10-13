using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatApp.Web.Models.Chat
{
	public class Chatroom
	{
		private ConcurrentQueue<Message> _messageQueue;
		private ConcurrentDictionary<string,ChatUser> _users;
		private static int MAX = 1000;
		public bool IsPrivate {get;set;}
		public string Password {get;set;}

		public Chatroom()
		{
			this._messageQueue=new ConcurrentQueue<Message>();
			this._users = new ConcurrentDictionary<string, ChatUser>();
		}

		public bool AddUser(string uId)
		{
			ChatUser u = ChatUser.GetUserById(uId);
			if(_users.TryAdd(uId,u))
			{
				return true;
			}
			return false;
		}

		public bool RemoveUser(string uId)
		{
			if(!_users.ContainsKey(uId))
				return true;
			ChatUser u = null;
			if(_users.TryRemove(uId,out u))
			{
				return true;
			}
			return false;
		}

		public bool AddMessage(Message m)
		{
			_messageQueue.Enqueue(m);
			if(_messageQueue.Count>=MAX)
			{
				m = null;
				while (!_messageQueue.TryDequeue(out m))
					continue;
			}
			return true;
		}

		public bool ContainsUser(string uId)
		{
			return _users.ContainsKey(uId);
		}
	}
}