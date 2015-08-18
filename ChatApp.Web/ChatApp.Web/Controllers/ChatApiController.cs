using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Mvc;
using ChatApp.Web.Models.Chat;
using Newtonsoft.Json;

namespace ChatApp.Web.Controllers
{
    public class ChatApiController : ApiController
    {
		private static readonly ConcurrentQueue<StreamWriter> _subscribers = new ConcurrentQueue<StreamWriter>();
        // GET api/chat
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }


        // GET api/chat/5
        public string Get(int id)
        {
            return "value";
        }

		public HttpResponseMessage Get(HttpRequestMessage request)
		{
			HttpResponseMessage response = request.CreateResponse();
			response.Content = new PushStreamContent(OnStreamAvailable, "text/event-stream");
			return response;
		}

		private static void OnStreamAvailable(Stream stream, HttpContent content, TransportContext context)
		{
			StreamWriter sw = new StreamWriter(stream);
			_subscribers.Enqueue(sw);
		}

		public void Post(Message m)
		{
			m.Timestamp = DateTime.Now.ToString("MM/dd/yyyy HH:MM:SS");
			ProcessMessage(m);
		}

		private static void ProcessMessage(Message m)
		{
			foreach(StreamWriter sw in _subscribers)
			{
				sw.WriteLine("data:" + JsonConvert.SerializeObject(m) + "n");
				sw.Flush();
			}
		}
        // POST api/chat
        public void Post([FromBody]string value)
        {
        }

        // PUT api/chat/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/chat/5
        public void Delete(int id)
        {
        }
    }
}
