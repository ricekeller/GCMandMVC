using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Web.Http;
using System.Web.Mvc;
using ChatApp.Web.Models.Chat;
using Newtonsoft.Json;

namespace ChatApp.Web.Controllers
{
	public class ChatApiController : ApiController
	{
		private static readonly ConcurrentDictionary<string, ClientInfo> _subscribers = new ConcurrentDictionary<string, ClientInfo>();
		private static readonly BlockingCollection<Message> _messageQueue = new BlockingCollection<Message>(new ConcurrentQueue<Message>());
		private static RNGCryptoServiceProvider rnd = new RNGCryptoServiceProvider();
		private static int CLIENTIDLENGTH = 16;
		private static Thread worker = new Thread(new ThreadStart(ProcessMessage));

		static ChatApiController()
		{
			worker.Start();
		}
		private static void ProcessMessage()
		{
			while(true)
			{
				Message m = _messageQueue.Take();
				UpdateDisplayName(m);
				SendMessage(m);
			}
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
			sw.AutoFlush = true;
			string id = GenerateID();
			_subscribers.GetOrAdd(id, new ClientInfo() { StreamWriter = sw });
			sw.WriteLine("event:" + "clientid" + "\n" + FormatMessage(id));
			sw.Flush();
		}

		private static string FormatMessage(object msg)
		{
			return "data:" + JsonConvert.SerializeObject(msg) + "\n\n";
		}

		private static string GenerateID()
		{
			byte[] b = new byte[CLIENTIDLENGTH];
			rnd.GetBytes(b);
			string id = Encoding.UTF8.GetString(b);
			while (_subscribers.ContainsKey(id))
			{
				rnd.GetBytes(b);
				id = Encoding.UTF8.GetString(b);
			}
			return id;
		}

		public void Post(Message m)
		{
			m.Timestamp = DateTime.Now.ToString("MM/dd/yyyy HH:MM:ss");
			_messageQueue.Add(m);
		}

		private static void UpdateDisplayName(Message m)
		{
			if (string.IsNullOrWhiteSpace(m.ClientId)) return;
			ClientInfo c = null;
			if (_subscribers.TryGetValue(m.ClientId, out c))
			{
				if (string.IsNullOrWhiteSpace(c.DisplayName))
				{
					c.DisplayName = m.Sender;
				}
			}
		}

		private static void SendMessage(Message m)
		{
			foreach (KeyValuePair<string, ClientInfo> kv in _subscribers)
			{
				try
				{
					kv.Value.StreamWriter.WriteLine(FormatMessage(m));
					kv.Value.StreamWriter.Flush();
				}
				catch (IOException ex)
				{
					ClientInfo removed = null;
					if (_subscribers.TryRemove(kv.Key, out removed))
					{
						kv.Value.StreamWriter.Close();
						//send disconnect message
					}
					Console.WriteLine(ex.Message);
				}
				catch (Exception ex2)
				{
					Console.WriteLine(ex2.Message);
				}
			}
		}
	}
}
