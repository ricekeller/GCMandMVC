using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using MongoDB.Driver.Builders;

namespace ChatApp.Web.Models
{
	/// <summary>
	/// This class stores who bought how many baozi
	/// </summary>
	[Serializable]
	public class BaoziEntry
	{
		[Required]
		public string Buyer { get; set; }
		[Range(1,1000)]
		[Required]
		public int Quantity { get; set; }

		/// <summary>
		/// This is used to check if this entry is valid, if it is not, it won't be added to the collection
		/// </summary>
		/// <returns>true:valid false:invalid </returns>
		public bool IsValid()
		{
			if(string.IsNullOrWhiteSpace(Buyer))
			{
				return false;
			}
			if(Quantity<1||Quantity>1000)
			{
				return false;
			}
			return true;
		}
	}
	/// <summary>
	/// This class stores the date when the order is placed and a collections of BaoziEntry.
	/// </summary>
	[Serializable]
	public class BaoziCollection
	{
		[BsonId]
		[BsonRepresentation(BsonType.ObjectId)]
		public string Id { get; set; }
		public DateTime OrderDate { get; set; }
		public Dictionary<string,BaoziEntry> Entries { get; set; }

		public BaoziCollection() 
		{
			Entries = new Dictionary<string, BaoziEntry>();
		}
		public BaoziCollection(IEnumerable<BaoziEntry> src)
		{
			Entries = new Dictionary<string, BaoziEntry>();
			foreach(BaoziEntry be in src)
			{
				if(be.IsValid())
				{
					be.Buyer = be.Buyer.Trim();
					Add(be);
				}
			}
		}
		/// <summary>
		/// Save this order to the db
		/// </summary>
		/// <param name="errorMsg"></param>
		public void Save(out string errorMsg)
		{
			string t = null;
			BaoziDB.Save(this, out t);
			errorMsg = t;
		}
		/// <summary>
		/// Add a BaoziEntry to this order
		/// </summary>
		/// <param name="be"></param>
		public void Add(BaoziEntry be)
		{
			if(!Entries.ContainsKey(be.Buyer))
			{
				Entries.Add(be.Buyer, be);
			}
			else
			{
				BaoziEntry tmp = Entries[be.Buyer];
				tmp.Quantity += be.Quantity;
			}
		}
		public void Remove(BaoziEntry be)
		{
			if(Entries.ContainsKey(be.Buyer))
			{
				Entries.Remove(be.Buyer);
			}
		}
		public int Count()
		{
			return Entries.Count;
		}

		public IEnumerator<BaoziEntry> GetEnumerator()
		{
			return Entries.Values.ToList<BaoziEntry>().GetEnumerator();
		}
	}

	/// <summary>
	/// The database access layer.
	/// </summary>
	internal static class BaoziDB
	{
		private static MongoDatabase _db;
		private static MongoCollection<BaoziCollection> _baoziCollection;
		private static string _COLLECTIONNAME = "BaoziCollection";

		/// <summary>
		/// Initialize the db if it hasn't been initialized.
		/// </summary>
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
		/// <returns>The MongoDatabase object</returns>
		private static MongoDatabase GetMongoConnection(String connectionString)
		{
			BaoziEntryMapping.Register();
			BaoziCollectionMapping.Register();
			var mongoUrl = MongoUrl.Create(connectionString);
			var server = new MongoClient(connectionString).GetServer();
			return server.GetDatabase(mongoUrl.DatabaseName);
		}

		/// <summary>
		/// Save a BaoziCollection to db.
		/// </summary>
		/// <param name="bc">The BaoziCollection object to be saved</param>
		/// <param name="errMsg">The output error message if the save operation fails</param>
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
				return;
			}
			if (null == result)
			{
				errMsg = "Save to database did not return a status result";
			}
			else if (!result.Ok)
			{
				errMsg = result.LastErrorMessage;
			}
			else
			{
				errMsg = null;
			}
		}

		/// <summary>
		/// Get all baozi orders from the db
		/// </summary>
		/// <returns>A list of orders</returns>
		public static List<BaoziCollection> GetAllBaoziCollection()
		{
			Init();
			MongoCursor<BaoziCollection> col = _baoziCollection.FindAll().SetSortOrder(SortBy<BaoziCollection>.Descending(a => a.OrderDate));
			return col.ToList<BaoziCollection>();
		}
	}

	/// <summary>
	/// The mapping class that will map BaoziCollection object to db document.
	/// </summary>
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
					cm.GetMemberMap(c => c.Id).SetRepresentation(MongoDB.Bson.BsonType.ObjectId);
					cm.GetMemberMap(c => c.OrderDate).SetElementName("order_date");
					cm.GetMemberMap(c => c.Entries).SetElementName("order_entries");
				});
			}
		}
	}
	/// <summary>
	/// The mapping class that will map BaoziEntry object to db document.
	/// </summary>
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
					cm.GetMemberMap(c => c.Buyer).SetElementName("buyer");
					cm.GetMemberMap(c => c.Quantity).SetElementName("quantity");
				});
			}
		}
	}
}