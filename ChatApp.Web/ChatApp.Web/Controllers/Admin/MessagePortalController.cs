using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;
using ChatApp.MongoDB;
using ChatApp.MongoDB.BI.Model;
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
                return new MessagePortalResponse() { Status = Constants.FAIL, FullMessage = "Invalid data posted!" };
            }
            if(!msg.IsValid())
            {
                MessagePortalResponse mpr = new MessagePortalResponse() { Status=Constants.FAIL};
                StringBuilder sb = new StringBuilder();
                foreach(string em in msg.GetErrorMsgs())
                {
                    sb.AppendLine(em);
                }
                mpr.FullMessage = sb.ToString();
                return mpr;
            }
            //2.get sender regID and receiver regID from the DB
            ValidateRegIDs(msg);
            //3.using GCMServerHelper to send message to GCM
            GCMServerHelper.GetInstance().SendMessage(msg);
            return new MessagePortalResponse() { Status = Constants.SUCCESS, FullMessage = "Message is sent!" };
        }

        private void ValidateRegIDs(Message msg)
        {

            throw new NotImplementedException();
        }
    }
}
