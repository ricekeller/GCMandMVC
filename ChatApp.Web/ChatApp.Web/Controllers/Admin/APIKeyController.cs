using System;
using System.Net.Http;
using System.Web.Http;
using ChatApp.MongoDB;
using ChatApp.MongoDB.BI;
using ChatApp.MongoDB.BI.Model;
using ChatApp.Web.Models;

namespace ChatApp.Web.Controllers.Admin
{
    public class APIKeyController : ApiController
    {
        [HttpGet]
        public Response GetKey()
        {
            return new APIKeyResponse() { Status = Constants.SUCCESS, Key = APIKeyBI.GetAPIKey() };
        }

        [HttpPost]
        public Response UpdateKey([FromBody]string key)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                return new APIKeyResponse() { Status = Constants.FAIL };
            }
            APIKeyBI.UpdateAPIKey(key);
            return new APIKeyResponse() { Status = Constants.SUCCESS };
        }
    }
}
