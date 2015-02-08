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

            //TestBinaryAndString();
            //Console.ReadKey();

            var webAddr = "http://localhost:59957/Location/SaveLocation";
            WebClient wc = new WebClient();
            wc.Headers.Add("Content-Type", "application/json");
            var data = new JavaScriptSerializer().Serialize(new {
                    Latitude = "43.067448",
                    Longitude = "-89.412069",
                    Timestamp=DateTime.UtcNow
            });
            string result = wc.UploadString(webAddr, "POST", data);
            
        }
        private static string String2Binary(string s)
        {
            byte[] b = Encoding.UTF8.GetBytes(s);
            StringBuilder sb = new StringBuilder();
            for(int i=0;i<b.Length;i++)
            {
                string tmp = Convert.ToString(b[i], 2).PadLeft(8,'0');
                sb.Append(tmp);
            }
            return sb.ToString();
        }
        private static string Binary2String(string binaryS)
        {
            if(binaryS.Length%8!=0)
            {
                throw new ArgumentException("Input argument is not valid!");
            }
            byte[] b = new byte[binaryS.Length / 8];
            for(int i=0;i<binaryS.Length;i+=8)
            {
                b[i / 8] = Convert.ToByte(binaryS.Substring(i, 8), 2);
            }
            return Encoding.UTF8.GetString(b);
        }
        private static void TestBinaryAndString()
        {
            string[] from = new string[9]{
                "I'm Yan!",
                "哈哈哈哈！@",
                "我不知道這是啥啊。。。",
                "這個是地址：http://madisonccc.org/",
                "Just a test:!@$#@#%#^$%&%(*&*)OL:",
                "01010101",
                "22222222",
                "11111111",
                "00000001",
            };

            string[] to = new string[9];
            for(int i=0;i<9;i++)
            {
                to[i] = String2Binary(from[i]);
                Console.WriteLine("Test {0} - binary:{1}", i, to[i]);
                Console.WriteLine("Test {0} - string:{1}", i, Binary2String(to[i]));
            }
        }
        private static void SendMsg()
        {
            var webAddr = "http://localhost:59957/api/messageportal";
            WebClient wc = new WebClient();
            wc.Headers.Add("Content-Type", "application/json");
            //wc.Headers.Add("Accept", "text/html, application/xhtml+xml, */*");
            var data = new JavaScriptSerializer().Serialize(
                new
                {
                    RawMessage = Encoding.UTF8.GetBytes("Test Message: Hello ~~~~!~@#!@%$@#%^"),
                    MessageType = 0,
                    SendTimeStamp = DateTime.UtcNow,
                    Sender = new { Id = "54cd41d928851c2930dad75e", Name = "test1", RegistrationId = "1111111111111" },
                    Receiver = new { Id = "54cd41d928851c2930dad75f", Name = "test2", RegistrationId = "222222" }
                }
                );
            string result = wc.UploadString(webAddr, "POST", data);
        }
        private static List<string> _errorMsgs;
        public static void TestYieldReturn()
        {
            _errorMsgs = new List<string>();
            for (int i = 0; i < 10; i++)
            {
                _errorMsgs.Add("the number now is: " + i);
            }
            foreach (string s in GetErrorMsgs())
            {
                Console.WriteLine(s);
            }
            Console.ReadKey();
        }
        public static IEnumerable<string> GetErrorMsgs()
        {
            for (int i = 0; i < _errorMsgs.Count; i++)
            {
                yield return _errorMsgs[i];
            }
        }
    }
}
