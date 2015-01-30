using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Driver.Builders;

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

        public MongoCollection GetCollection(string collection)
        {
            if (string.IsNullOrWhiteSpace(collection))
            {
                return null;
            }
            return _db.GetCollection(collection);
        }

        public T GetOne<T>(string collectionName,Expression<Func<T,bool>> criteria,params Expression<Func<T,object>>[] fields)
        {
            if(string.IsNullOrWhiteSpace(collectionName)||null==criteria)
            {
                return default(T);
            }
            var col = _db.GetCollection(collectionName);
            if(null!=col)
            {
                var result = col.FindAs<T>(Query<T>.Where(criteria)).SetFields(Fields<T>.Include(fields)).ToList<T>();
                if(null!=result&&result.Count>0)
                {
                    return result[0];
                }
                return default(T);
            }
            return default(T);
        }

        public List<T> GetMany<T>(string collectionName, Expression<Func<T, bool>> criteria, params Expression<Func<T, object>>[] fields)
        {
            if (string.IsNullOrWhiteSpace(collectionName) || null == criteria)
            {
                return null;
            }
            var col = _db.GetCollection(collectionName);
            if (null != col)
            {
                return col.FindAs<T>(Query<T>.Where(criteria)).SetFields(Fields<T>.Include(fields)).ToList<T>();
            }
            return null;
        }
    }
}
