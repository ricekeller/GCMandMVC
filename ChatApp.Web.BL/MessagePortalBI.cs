using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ChatApp.Model;
using ChatApp.MongoDB;
using MongoDB.Driver;
using MongoDB.Driver.Builders;

namespace ChatApp.Web.BL
{
    public static class MessagePortalBI
    {
        public static AppUser GetUserByID(string id)
        {
            if(string.IsNullOrWhiteSpace(id))
            {
                return null;
            }
            return DB.Instance().GetOne<AppUser>("User",a=>a.Id.Equals(id),a=>a.Id,a=>a.Name,a=>a.RegistrationId);
        }
        public static List<AppUser> GetUserByName(string name)
        {
            if(string.IsNullOrWhiteSpace(name))
            {
                return null;
            }
            return DB.Instance().GetMany<AppUser>("User",a=>a.Name==name,a=>a.Id,a=>a.Name,a=>a.RegistrationId);
        }
        public static bool UpdateUser(AppUser u)
        {
            return DB.Instance().GetCollection<AppUser>("User").Save(u).Ok;
        }

        public static void ValidateRegID(Message msg)
        {
            var oldRegID = DB.Instance().GetOne<AppUser>("User", a => a.Id.Equals(msg.Sender.Id), a => a.RegistrationId).RegistrationId;
            if (string.IsNullOrWhiteSpace(oldRegID) || !oldRegID.Equals(msg.Sender.RegistrationId))
            {
                //save new regID to BD
                MessagePortalBI.UpdateUser(msg.Sender);
            }
        }
    }
}
