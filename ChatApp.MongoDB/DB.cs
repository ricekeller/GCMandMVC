using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Driver;

namespace ChatApp.MongoDB
{
    public class DB
    {
        private static DB _istance=new DB();
        private const string _connectionString = "mongodb://miyanadmin:miyanadmin@ds049219.mongolab.com:49219/chatappdb";
        private MongoClient _client;
        private MongoServer _server;
        private MongoDatabase _db;
        private DB() 
        {
            _client = new MongoClient(_connectionString);
            _server = _client.GetServer();
            _db = _server.GetDatabase("chatappdb");
        }
        public static DB Instance()
        {
            return _istance;
        }

        public MongoCollection<T> GetCollection<T>(string collection)
        {
            if(string.IsNullOrWhiteSpace(collection))
            {
                return null;
            }
            return _db.GetCollection<T>(collection);
        }


    }
}
