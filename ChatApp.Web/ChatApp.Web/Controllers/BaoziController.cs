using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

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

		[Authorize]
		public ActionResult Admin()
		{
			return View();
		}
    }
}
