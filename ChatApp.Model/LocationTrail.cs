using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;

namespace ChatApp.Model
{
    public class LocationTrail
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        public string Id { get; set; }
        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
