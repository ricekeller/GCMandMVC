using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ChatApp.MongoDB;

namespace ChatApp.MongoDB.BI.Model
{
    public class APIKeyResponse:Response
    {
        public string Key { get; set; }
    }
}