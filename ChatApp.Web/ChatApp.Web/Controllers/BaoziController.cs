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
			return View(BaoziDB.GetAllBaoziCollection());
        }

		[Authorize()]
		[HttpPost]
		public ActionResult Admin(List<BaoziEntry> order)
		{
			BaoziCollection bc = new BaoziCollection(order);
			bc.OrderDate = DateTime.Now;
			string err = null;
			bc.Save(out err);
			//TODO: display err
			return RedirectToAction("Index");
		}
    }
}
