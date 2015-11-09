using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;

namespace ChatApp.Web.Models
{
	[Serializable]
	public class BaoziEntry
	{
		public string Buyer { get; set; }
		public int Quantity { get; set; }
	}
	[Serializable]
	public class BaoziCollection : List<BaoziEntry>
	{
		public DateTime OrderDate { get; set; }

		public void Save(out string errorMsg)
		{
			string t = null;
			BaoziDB.Save(this, out t);
			errorMsg = t;
		}
	}

	internal static class BaoziDB
	{
		private static MongoDatabase _db;
		private static MongoCollection<BaoziCollection> _baoziCollection;
		private static string _COLLECTIONNAME = "BaoziCollection";

		private static void Init()
		{
			if (null == _db)
			{
				string conName = System.Configuration.ConfigurationManager.ConnectionStrings["MongoConnection"].ConnectionString;
				if (!string.IsNullOrWhiteSpace(conName))
				{
					_db = GetMongoConnection(conName);
				}
			}

			if (null == _db)
				return;

			if (null == _baoziCollection)
			{
				_baoziCollection = _db.GetCollection<BaoziCollection>(_COLLECTIONNAME);
			}
			if (null == _baoziCollection)
				return;
		}

		/// <summary>
		/// Gets the mongo connection.
		/// </summary>
		/// <param name="connectionString">The connection string.</param>
		/// <returns></returns>
		private static MongoDatabase GetMongoConnection(String connectionString)
		{
			BaoziEntryMapping.Register();
			BaoziCollectionMapping.Register();
			var mongoUrl = MongoUrl.Create(connectionString);
			var server = new MongoClient(connectionString).GetServer();
			return server.GetDatabase(mongoUrl.DatabaseName);
		}

		public static void Save(BaoziCollection bc, out string errMsg)
		{
			Init();
			WriteConcernResult result = null;
			try
			{
				result = _baoziCollection.Save(bc, WriteConcern.Acknowledged);
			}
			catch (Exception ex)
			{
				errMsg = ex.Message;
			}
			if (null == result)
			{
				errMsg = "Save to database did not return a status result";
			}
			else if (!result.Ok)
			{
				errMsg = result.LastErrorMessage;
			}
			errMsg = null;
		}
	}

	internal class BaoziCollectionMapping
	{
		public static void Register()
		{
			if (!BsonClassMap.IsClassMapRegistered(typeof(BaoziCollection)))
			{
				// Initialize Mongo Mappings
				BsonClassMap.RegisterClassMap<BaoziCollection>(cm =>
				{
					cm.AutoMap();
					cm.SetIgnoreExtraElements(true);
					cm.SetIsRootClass(true);
					cm.GetMemberMap(c => c.OrderDate).SetElementName("order_date");
				});
			}
		}
	}
	internal class BaoziEntryMapping
	{
		public static void Register()
		{
			if (!BsonClassMap.IsClassMapRegistered(typeof(BaoziEntry)))
			{
				// Initialize Mongo Mappings
				BsonClassMap.RegisterClassMap<BaoziEntry>(cm =>
				{
					cm.AutoMap();
					cm.SetIgnoreExtraElements(true);
					cm.SetIsRootClass(true);
					cm.GetMemberMap(c => c.Buyer).SetElementName("buyer");
					cm.GetMemberMap(c => c.Quantity).SetElementName("quantity");
				});
			}
		}
	}
}