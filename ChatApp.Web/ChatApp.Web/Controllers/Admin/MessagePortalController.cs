using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using ChatApp.Web.Models;

namespace ChatApp.Web.Controllers.Admin
{
    public class MessagePortalController : ApiController
    {
        // POST api/messageportal
        [HttpPost]
        public void Post([FromBody]Message msg)
        {
            //1.validate 

            //2.get sender regID and receiver regID from the DB

            //3.using GCMServerHelper to send message to GCM

            //4.process GCM response
        }
    }
}
