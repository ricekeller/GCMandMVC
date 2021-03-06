﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Driver.Builders;
using MongoDB.Bson;
using MongoDB.Driver;
using ChatApp.MongoDB;
using ChatApp.Model;

namespace ChatApp.Web.BL
{
    public static class APIKeyBI
    {
        private const string APIKEY = "APIKEY";
        public static string GetAPIKey()
        {
            var query = Query<APIKey>.EQ(e => e.Id, APIKEY);
            var col=DB.Instance().GetCollection<APIKey>(APIKEY);

            return col.FindOne(query).Key;
        }
        public static bool UpdateAPIKey(string newAPIKey)
        {
            if(string.IsNullOrWhiteSpace(newAPIKey))
            {
                return false;
            }
            var newKey = new APIKey() { Id = APIKEY, Key = newAPIKey };
            var col = DB.Instance().GetCollection<APIKey>(APIKEY);
            col.Save(newKey);
            return true;
        }
    }
}
