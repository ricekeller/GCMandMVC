using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Builders;

namespace mongotest
{
    public class Entity
    {
        public ObjectId Id { get; set; }
        public string Name { get; set; }
    }
    class Program
    {
        static void Main(string[] args)
        {
            //var connectionString = "mongodb://devtest:devtest@ds029541.mongolab.com:29541/devtest";
            //var client = new MongoClient(connectionString);
            //var server = client.GetServer();
            //var database = server.GetDatabase("devtest");
            //var collection = database.GetCollection<Entity>("entities");


            //var entity = new Entity { Name = "Tom" };
            //collection.Insert(entity);
            //var id = entity.Id;

            //var query = Query<Entity>.EQ(e => e.Id, id);
            //entity = collection.FindOne(query);

            //entity.Name = "Dick";
            //collection.Save(entity);

            //var update = Update<Entity>.Set(e => e.Name, "Harry");
            //collection.Update(query, update);

            //collection.Remove(query);
            
            //for(int i=0;i<10000;i++)
            //{
            //    var entity = new Entity() { Name = i.ToString() };
            //    collection.Insert(entity);
            //}


			//post data
			//var webAddr = "https://android.googleapis.com/gcm/send";
			//WebClient wc = new WebClient();
			//wc.Headers.Add("Authorization", "key=AIzaSyAn1OWBTbBaUPQlWu-u6zKB7UOvTVPp1b8");
			//wc.Headers.Add("Content-Type", "application/json");
			//var data = new JavaScriptSerializer().Serialize(
			//		new
			//		{
			//			registration_ids = new string[2] { "A", "B" },
			//			data = new {message="This is the message."}
			//		}
			//	);
			//string result = wc.UploadString(webAddr, "POST", data);
			//DateTime d1 = new DateTime(1, 1, 1);
			//DateTime d2 = new DateTime(3000, 12, 12);
			//TimeSpan ts = d2.Subtract(d1);
			//ts = d1.Subtract(d2);


            //var webAddr = "http://localhost:59957/api/APIKey";
            //WebClient wc = new WebClient();
            //wc.Headers.Add("Content-Type", "application/json");
            //wc.Headers.Add("Accept", "text/html, application/xhtml+xml, */*");
            //wc.Headers.Add("key", "1234h");
            //var data = new JavaScriptSerializer().Serialize(
            //        "AIzaSyAn1OWBTbBaUPQlWu-u6zKB7UOvTVPp1b8"
            //    );
            //string result = wc.UploadString(webAddr, "POST", data);
            string[] ss = {"",null," ","   "};
            foreach(string s in ss)
            {
                Console.WriteLine("Space:"+string.IsNullOrWhiteSpace(s));
                Console.WriteLine("Empty:" + string.IsNullOrEmpty(s));
            }
            Console.ReadKey();
        }
    }
}
