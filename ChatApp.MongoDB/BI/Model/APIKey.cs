using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson;

namespace ChatApp.MongoDB.BI.Model
{
    public class APIKey
    {
        public string Id { get; set; }
        public string Key { get; set; }
    }
}
