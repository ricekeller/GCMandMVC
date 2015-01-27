using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;
using ChatApp.MongoDB;
using ChatApp.Web.Models;

namespace ChatApp.Web.Controllers.Admin
{
    public class MessagePortalController : ApiController
    {
        // POST api/messageportal
        [HttpPost]
        public MessagePortalResponse Post([FromBody]Message msg)
        {
            //1.validate 
            if(null==msg)
            {
                return new MessagePortalResponse() { Status = Enum.GetName(typeof(ResponseStatus),ResponseStatus.Fail), FullMessage = "Invalid data posted!" };
            }
            if(!msg.IsValid())
            {
                MessagePortalResponse mpr = new MessagePortalResponse();
                mpr.Status = Enum.GetName(typeof(ResponseStatus), ResponseStatus.Fail);
                StringBuilder sb = new StringBuilder();
                foreach(string em in msg.GetErrorMsgs())
                {
                    sb.AppendLine(em);
                }
                mpr.FullMessage = sb.ToString();
                return mpr;
            }
            //2.get sender regID and receiver regID from the DB

            //3.using GCMServerHelper to send message to GCM

            //4.process GCM response
        }
    }
}
