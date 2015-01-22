using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using ChatApp.MongoDB;
using ChatApp.Web.Models;

namespace ChatApp.Web.Controllers
{
    public class APIKeyController : ApiController
    {
        [HttpGet]
        public Response GetKey()
        {
            return "123";
        }

        public Response UpdateKey(string key)
        {
            if(string.IsNullOrWhiteSpace(key))
            {
                return new APIKeyResponse() { Status = "Fail" };
            }


            return new APIKeyResponse() { Status="Success"};
        }
    }
}
