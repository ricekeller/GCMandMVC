using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson.Serialization.Attributes;

namespace ChatApp.Model
{
	public class UserAccount
	{
		[BsonId]
		public string Email { get; set; }
		public string PassHash { get; set; }
	}
}
