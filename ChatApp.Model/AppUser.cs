using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;

namespace ChatApp.Model
{
    public class AppUser
    {
        [BsonId(IdGenerator=typeof(StringObjectIdGenerator))]
        public string Id { get; set; }
        public string Name { get; set; }
        public string RegistrationId { get; set; }

        public bool IsValid()
        {
            return !string.IsNullOrWhiteSpace(Id);
        }
    }
}