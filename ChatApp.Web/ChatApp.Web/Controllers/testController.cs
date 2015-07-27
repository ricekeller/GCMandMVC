using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ChatApp.Model;
using ChatApp.Web.BL;

namespace ChatApp.Web.Controllers
{
    public class testController : Controller
    {
        //
        // GET: /test/

        public ActionResult Index()
        {
            var tu1= MessagePortalBI.GetUserByName("test1");
            var tu2 = MessagePortalBI.GetUserByName("test2");
            return View();
        }

        public string GenerateUser()
        {
            AppUser u = null;
            for(int i=0;i<5;i++)
            {
                u = new AppUser() { Name = "test" + i };
                var res=MessagePortalBI.UpdateUser(u);
            }
            return "1";
        }

        public ActionResult test3()
        {
            return View("ThreeTest");
        }

        public ActionResult testm()
        {
            return View();
        }

		public ActionResult testp()
		{
			return View("Phaser");
		}

		public ActionResult caocao()
		{
			return View("Caocao");
		}
    }
}
