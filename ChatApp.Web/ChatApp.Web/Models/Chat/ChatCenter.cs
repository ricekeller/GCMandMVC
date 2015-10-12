using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatApp.Web.Models.Chat
{
	public static class ChatCenter
	{
		private static readonly ConcurrentDictionary<string, Chatroom> _rooms = new ConcurrentDictionary<string, Chatroom>();
		private static readonly ConcurrentDictionary<string,string> _userToRoomIndex=new ConcurrentDictionary<string,string>();
		private static readonly Random rnd=new Random();
		private static int MAX = Int32.MaxValue;

		public static List<Chatroom> GetRooms()
		{
			return _rooms.Values.ToList<Chatroom>();
		}

		public static int GetNumberOfRooms()
		{
			return _rooms.Count;
		}

		public static int GetNumberOfUsers()
		{
			return _userToRoomIndex.Count();
		}

		public static bool CreateRoom(bool isPrivate,string pwd,out string rId)
		{
			Chatroom r=null;
			rId = null;
			if(CreateRoom(out rId,out r))
			{
				r.IsPrivate = isPrivate;
				r.Password = pwd;
				return true;
			}
			return false;
		}

		private static bool CreateRoom(out string Id,out Chatroom room)
		{
			Id = null;
			room = null;
			string id = rnd.Next(MAX).ToString();
			while(_rooms.ContainsKey(id))
			{
				id = rnd.Next(MAX).ToString();
			}
			room=new Chatroom();
			if(_rooms.TryAdd(id,room))
			{
				Id = id;
				return true;
			}
			Id = null;
			return false;
		}

		public static bool AddUserToRoom(string uId,string rId)
		{
			if (!_rooms.ContainsKey(rId))
				return false;
			Chatroom r = null;

			if(_userToRoomIndex.Keys.Contains(uId))
			{
				string oldRID = null;
				if(_userToRoomIndex.TryRemove(uId, out oldRID)&&null!=oldRID&&_rooms.TryGetValue(oldRID,out r))
				{
					if (null != r && r.RemoveUser(uId))
					{
						if(_rooms.TryGetValue(rId,out r)&&null!=r&&r.AddUser(uId)&&_userToRoomIndex.TryAdd(uId,rId))
						{
							return true;
						}
						return false;
					}
					return false;
				}
				return false;
			}
			else
			{
				if (_rooms.TryGetValue(rId, out r) && null != r && r.AddUser(uId)&&_userToRoomIndex.TryAdd(uId,rId))
				{
					return true;
				}
				return false;
			}
		}
	}
}