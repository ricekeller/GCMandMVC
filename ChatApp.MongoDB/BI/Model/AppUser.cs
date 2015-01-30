using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ChatApp.MongoDB.BI.Model
{
    public class AppUser
    {
        public ObjectId Id { get; set; }
        public string Name { get; set; }
        public string RegistrationId { get; set; }

        public bool IsValid()
        {
            return null!=Id;
        }
    }
}