using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ChatApp.Web.Models.ViewModels;

namespace ChatApp.Web.Controllers
{
    public class AccountController : Controller
    {
        //
        // GET: /Account/

        public ActionResult Index()
        {
            return View();
        }

		[HttpGet]
		public ActionResult Login()
		{
			return View(new LoginViewModel());
		}

		[HttpPost]
		public ActionResult Login(LoginViewModel lvm)
		{
			if(ModelState.IsValid)
			{
				//do some login staff
			}
			return View(lvm);
		}

		[HttpGet]
		public ActionResult Register()
		{
			return View(new CreateAccountViewModel());
		}

		[HttpPost]
		public ActionResult Register(CreateAccountViewModel vm)
		{
			if(ModelState.IsValid)
			{
				//do some create staff
			}
			return View(vm);
		}
    }
}
