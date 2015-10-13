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
		private static readonly ConcurrentDictionary<string, List<string>> _userToRoomIndex = new ConcurrentDictionary<string, List<string>>();
		private static readonly Random rnd = new Random();
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

		public static bool CreateRoom(bool isPrivate, string pwd, out string rId)
		{
			Chatroom r = null;
			rId = null;
			if (CreateRoom(out rId, out r))
			{
				r.IsPrivate = isPrivate;
				r.Password = pwd;
				return true;
			}
			return false;
		}

		private static bool CreateRoom(out string Id, out Chatroom room)
		{
			Id = null;
			room = null;
			string id = rnd.Next(MAX).ToString();
			while (_rooms.ContainsKey(id))
			{
				id = rnd.Next(MAX).ToString();
			}
			room = new Chatroom();
			if (_rooms.TryAdd(id, room))
			{
				Id = id;
				return true;
			}
			Id = null;
			return false;
		}

		public static bool AddUserToRoom(string uId, string rId)
		{
			if (!_rooms.ContainsKey(rId))
				return false;

			Chatroom r = null;
			if (!AddUserToRoomIndex(uId, rId))
			{
				return false;
			}

			_rooms.TryGetValue(rId, out r);
			if (null == r)
			{
				return false;
			}

			if (!r.ContainsUser(uId))
			{
				r.AddUser(uId);
			}

			return true;
		}

		private static bool AddUserToRoomIndex(string uId, string rId)
		{
			List<string> rIds = null;
			if (!_userToRoomIndex.ContainsKey(uId))
			{
				rIds = new List<string>();
			}
			else
			{
				_userToRoomIndex.TryGetValue(uId, out rIds);
				if (null == rIds)
				{
					return false;
				}
			}
			if (!rIds.Contains(rId))
			{
				rIds.Add(rId);
			}

			_userToRoomIndex.AddOrUpdate(uId, rIds, (key, oldValue) => { return rIds; });
			return true;
		}

		public static Chatroom GetRoomById(string rId)
		{
			Chatroom r = null;
			_rooms.TryGetValue(rId, out r);
			return r;
		}

		public static List<Chatroom> GetRoomsUserIn(string uId)
		{
			List<string> rIds = null;
			_userToRoomIndex.TryGetValue(uId, out rIds);
			if (null != rIds)
			{
				List<Chatroom> res = new List<Chatroom>();
				foreach (string rId in rIds)
				{
					Chatroom r = null;
					_rooms.TryGetValue(rId, out r);
					if (null != r)
					{
						res.Add(r);
					}
				}
				return res;
			}
			return null;
		}
	}
}