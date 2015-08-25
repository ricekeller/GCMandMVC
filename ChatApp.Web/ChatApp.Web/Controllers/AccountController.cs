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
		public PartialViewResult Login()
		{
			return PartialView("_Login", new LoginViewModel());
		}

		[HttpPost]
		[ValidateAntiForgeryToken]
		public PartialViewResult Login(LoginViewModel lvm)
		{
			if (ModelState.IsValid)
			{
				if (Membership.ValidateUser(lvm.Email, lvm.Password))
				{
					//FormsAuthentication.RedirectFromLoginPage(lvm.Email, lvm.RememberMe);
					FormsAuthentication.SetAuthCookie(lvm.Email, false);
					return PartialView("_LoginSuccess", lvm.Email);
				}
				ModelState.AddModelError("", "Incorrect email and/or password!");
			}
			return PartialView("_Login", lvm);
		}

		[HttpGet]
		public PartialViewResult Register()
		{
			return PartialView("_Register", new CreateAccountViewModel());
		}

		[HttpPost]
		[ValidateAntiForgeryToken]
		public PartialViewResult Register(CreateAccountViewModel vm)
		{
			if (ModelState.IsValid)
			{
				MembershipCreateStatus status;
				MembershipUser u = Membership.CreateUser(vm.Email, vm.Password, vm.Email, null, null, true, out status);
				if (status == MembershipCreateStatus.Success && null != u)
				{
					//TODO: do something, redirect
					FormsAuthentication.SetAuthCookie(u.UserName, false);
					return PartialView("_RegisterSuccess", vm.Password);
				}
				ModelState.AddModelError("", "Can not create user! Please try again!");
			}
			return PartialView("_Register", vm);
		}
	}
}
