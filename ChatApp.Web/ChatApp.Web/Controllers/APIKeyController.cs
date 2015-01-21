using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace ChatApp.Web.Controllers
{
    public class APIKeyController : ApiController
    {
        [HttpGet]
        public string UpdateKey(string key)
        {
            return "123";
        }
    }
}
