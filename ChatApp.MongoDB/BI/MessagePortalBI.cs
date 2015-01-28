using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ChatApp.MongoDB.BI.Model;
using MongoDB.Driver;
using MongoDB.Driver.Builders;

namespace ChatApp.MongoDB.BI
{
    public static class MessagePortalBI
    {
        public static AppUser GetUser(string id)
        {
            var col = DB.Instance().GetCollection<AppUser>("User");
            var query=Query<AppUser>.EQ(e=>e.Id,id);
            var result = col.FindOne(query);
            return result;
        }
    }
}
