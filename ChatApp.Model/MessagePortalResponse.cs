using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatApp.Model
{
    public class MessagePortalResponse:Response
    {
        public string FullMessage { get; set; }
    }
}