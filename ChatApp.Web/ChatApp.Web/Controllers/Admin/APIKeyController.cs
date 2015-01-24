using System;
using System.Net.Http;
using System.Web.Http;
using ChatApp.MongoDB;
using ChatApp.MongoDB.BI;
using ChatApp.Web.Models;

namespace ChatApp.Web.Controllers.Admin
{
    public class APIKeyController : ApiController
    {
        [HttpGet]
        public Response GetKey()
        {
            return new APIKeyResponse() { Status = Enum.GetName(typeof(ResponseStatus),ResponseStatus.Success), 
                Key = APIKeyBI.GetAPIKey() };
        }

        [HttpPost]
        public Response UpdateKey([FromBody]string key)
        {
            if(string.IsNullOrWhiteSpace(key))
            {
                return new APIKeyResponse() { Status = "Fail" };
            }
            APIKeyBI.UpdateAPIKey(key);
            return new APIKeyResponse() { Status="Success"};
        }
    }
}
