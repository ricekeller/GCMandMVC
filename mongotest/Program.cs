﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
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
        }
    }
}
