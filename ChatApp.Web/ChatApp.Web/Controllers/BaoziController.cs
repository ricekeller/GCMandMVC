using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ChatApp.Web.Models;

namespace ChatApp.Web.Controllers
{
    public class BaoziController : Controller
    {
        //
        // GET: /Baozi/

        public ActionResult Index()
        {
            return View();
        }

		[Authorize()]
		public ActionResult Admin()
		{
			return View(BaoziDB.GetAllBaoziCollection());
		}

		[Authorize()]
		[HttpPost]
		public ActionResult Admin(BaoziCollection col)
		{
			col.OrderDate = DateTime.Now;
			string err = null;
			col.Save(out err);
			//TODO: display err
			return View(BaoziDB.GetAllBaoziCollection());
		}
    }
}
