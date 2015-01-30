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
        public static AppUser GetUserByID(string id)
        {
            if(string.IsNullOrWhiteSpace(id))
            {
                return null;
            }
            return DB.Instance().GetOne<AppUser>("User",a=>a.Id.ToString().Equals(id),a=>a.Id,a=>a.Name,a=>a.RegistrationId);
        }
        public static List<AppUser> GetUserByName(string name)
        {
            if(string.IsNullOrWhiteSpace(name))
            {
                return null;
            }
            return DB.Instance().GetMany<AppUser>("User",a=>a.Name==name,a=>a.Id,a=>a.Name,a=>a.RegistrationId);
        }
    }
}
