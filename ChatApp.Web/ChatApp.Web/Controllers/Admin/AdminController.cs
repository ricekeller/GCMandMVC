using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ChatApp.Web.BL;


namespace ChatApp.Web.Controllers.Admin
{
	[Authorize]
    public class AdminController : Controller
    {
        //
        // GET: /Admin/
        public ActionResult Index()
        {
            return View();
        }


        public ActionResult ApiKey()
        {
            return View();
        }

        [HttpPost]
        public ActionResult ApiKey(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                ModelState.AddModelError("Model", "Key can't be blank!");
            }
            else
            {
                APIKeyBI.UpdateAPIKey(key);
            }
            return View((object)key);
        }
    }
}
