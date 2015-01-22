using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace MvcApplication1.Controllers
{
    public class test
    {
        public string a;
        public int b;
        public List<string> c = new List<string>() { "123","234","345"};
    }
    public class aController : ApiController
    {
        // GET api/a
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/a/5
        public test Get(int id)
        {
            return new test() { a="1",b=2 };
        }

        // POST api/a
        public void Post([FromBody]string value)
        {
        }

        // PUT api/a/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/a/5
        public void Delete(int id)
        {
        }
    }
}
