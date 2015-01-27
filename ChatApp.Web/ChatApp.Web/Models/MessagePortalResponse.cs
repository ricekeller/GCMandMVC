using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ChatApp.MongoDB;

namespace ChatApp.Web.Models
{
    public class MessagePortalResponse:Response
    {
        public string FullMessage { get; set; }
    }
}