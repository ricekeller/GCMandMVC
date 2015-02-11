using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ChatApp.Model;
using ChatApp.MongoDB;
using MongoDB.Driver.Builders;
using MongoDB.Driver.Linq;

namespace ChatApp.Web.BL
{
    public static class LocationBI
    {
        private static string COLLECTIONNAME = "Locations";
        public static bool SaveLoc(LocationTrail loc)
        {
            return DB.Instance().GetCollection<LocationTrail>(COLLECTIONNAME).Save(loc).Ok;
        }
        public static LocationTrail GetLastLoc()
        {
            var col = DB.Instance().GetCollection<LocationTrail>(COLLECTIONNAME).Find(Query.LTE("Timestamp", DateTime.Now));
            return col.LastOrDefault();
        }
    }
}
