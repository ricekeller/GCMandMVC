using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Script.Serialization;
using Newtonsoft.Json.Linq;

namespace MvcApplication1.Models
{
	public class GCMServerHelper
	{
		private static GCMServerHelper _instance=new GCMServerHelper();
		private string APIKEY = "AIzaSyAn1OWBTbBaUPQlWu-u6zKB7UOvTVPp1b8";
		private const string GCM_SERVER="https://android.googleapis.com/gcm/send";
		private const string INVALID = "InvalidRegistration";
		private const string APIKEYFILE = "~/Content/APIKEY.dat";

		private GCMServerHelper()
		{

		}
		public static GCMServerHelper GetInstance()
		{
			return _instance;
		}

		public string SendMessage(string msg,string regId)
		{
			WebClient wc = new WebClient();
			wc.Headers.Add("Authorization", "key="+APIKEY);
			wc.Headers.Add("Content-Type", "application/json");
			var data = new JavaScriptSerializer().Serialize(
					new
					{
						registration_ids = new string[1] { regId },
						data = new { message = msg }
					}
				);
			return wc.UploadString(GCM_SERVER, "POST", data);
		}
		public string SendMulticastMessage(string msg,params string[] regIds)
		{
			throw new NotImplementedException();
		}

		public bool IsRegistrationIdValid(string regId)
		{
			WebClient wc = new WebClient();
			wc.Headers.Add("Authorization", "key=" + APIKEY);
			wc.Headers.Add("Content-Type", "application/json");
			var data = new JavaScriptSerializer().Serialize(
					new
					{
						registration_ids = new string[1] { regId },
					}
				);
			//Dictionary<string, object> result = (Dictionary<string, object>)GetResponseObjectFromJSON(wc.UploadString(GCM_SERVER, "POST", data));
			//result = result["results"] as Dictionary<string,object>;
			JObject result= JObject.Parse(wc.UploadString(GCM_SERVER, "POST", data));
			JToken results= result.GetValue("results");
			JObject first = results.First as JObject;
			if(null!=first)
			{
				JValue error = first.GetValue("error") as JValue;
				if(null!=error)
				{
					string errMsg = error.Value.ToString();
					if(!string.IsNullOrWhiteSpace(errMsg)&&errMsg.Contains(INVALID))
					{
						return false;
					}
				}
			}
			return true;
		}

		private Object GetResponseObjectFromJSON(string jsonResult)
		{
			return new JavaScriptSerializer().DeserializeObject(jsonResult);
		}

		public bool SaveAPIKEY2File(string key,HttpServerUtilityBase server)
		{
			try
			{
				//1. save to file
				using(StreamWriter sw = new StreamWriter(File.Create(server.MapPath(APIKEYFILE))))
				{
					sw.WriteLine(key);
					sw.Flush();
					sw.Close();
				}
				//2. update the variable
				this.APIKEY = key;
				return true;
			}
			catch(Exception e)
			{
				Console.WriteLine(e.Message + "\n" + e.StackTrace);
				return false;
			}
		}

		public bool LoadAPIKEYFromFile(HttpServerUtilityBase server)
		{
			try
			{
				using(StreamReader sr=new StreamReader(new FileStream(server.MapPath(APIKEYFILE),FileMode.Open)))
				{
					this.APIKEY = sr.ReadLine();
					sr.Close();
				}
				return true;
			}
			catch (Exception e)
			{
				Console.WriteLine(e.Message + "\n" + e.StackTrace);
				return false;
			}
		}
		//TODO:
		//2. implement exponential back off algorithm
		//3. 
	}
}