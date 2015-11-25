using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace ChatApp.Web.Models
{
	public static class SokobanUtils
	{
		private static MongoDatabase _db;
		private static MongoCollection<SokobanLevel> _levels;
		private static string _COLLECTIONNAME = "SokobanLevel";

		static SokobanUtils()
		{
			string conName = System.Configuration.ConfigurationManager.ConnectionStrings["MongoConnection"].ConnectionString;
			if (!string.IsNullOrWhiteSpace(conName))
			{
				var mongoUrl = MongoUrl.Create(conName);
				var server = new MongoClient(conName).GetServer();
				_db = server.GetDatabase(mongoUrl.DatabaseName);
				_levels = _db.GetCollection<SokobanLevel>(_COLLECTIONNAME);
			}
		}

		public static void Save(SokobanLevel lvl)
		{
			long cnt = _levels.Count();
			lvl.Name = "Level " + cnt;
			_levels.Save<SokobanLevel>(lvl);
		}

		public static List<SokobanLevel> GetAll()
		{
			return _levels.FindAll().ToList<SokobanLevel>();
		}
	}
	[Serializable]
	public class SokobanLevel
	{
		[BsonId]
		[BsonRepresentation(BsonType.ObjectId)]
		public string Id { get; set; }
		public string Name { get; set; }
		public string[] LevelData { get; set; }
	}
}