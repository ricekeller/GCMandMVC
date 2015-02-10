using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
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
				if(Membership.ValidateUser(lvm.Email,lvm.Password))
				{
					FormsAuthentication.RedirectFromLoginPage(lvm.Email, lvm.RememberMe);
				}
				ModelState.AddModelError("", "Incorrect email and/or password!");
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
				MembershipUser u=Membership.CreateUser(vm.Email,vm.Password,vm.Email);
				if(null!=u)
				{
					//TODO: do something
				}
				ModelState.AddModelError("", "Can not create user! Please try again!");
			}
			return View(vm);
		}
    }
}
