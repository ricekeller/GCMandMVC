using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;

namespace ChatApp.Model
{
	public class UserAccount
	{
		[BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
		public string Email { get; set; }
		public string PassHash { get; set; }
	}
}
