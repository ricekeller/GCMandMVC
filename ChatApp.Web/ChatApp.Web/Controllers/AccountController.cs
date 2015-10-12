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
		/// <summary>
		/// Login action viewed with url
		/// </summary>
		/// <returns></returns>
		public ActionResult Index()
		{
			return View();
		}

		/// <summary>
		/// Register action viewed with url
		/// </summary>
		/// <returns></returns>
		public ActionResult Signup()
		{
			return View();
		}

		/// <summary>
		/// Logout
		/// </summary>
		/// <returns></returns>
		public ActionResult Logout()
		{
			FormsAuthentication.SignOut();
			return RedirectToAction("Index", "Home");
		}

		public ActionResult ProfileDetail()
		{
			return View();
		}

		/// <summary>
		/// Login partial view
		/// </summary>
		/// <returns></returns>
		[HttpGet]
		public PartialViewResult Login()
		{
			return PartialView("_Login", new LoginViewModel());
		}

		/// <summary>
		/// Login partial view post
		/// </summary>
		/// <param name="lvm"></param>
		/// <returns></returns>
		[HttpPost]
		[ValidateAntiForgeryToken]
		public PartialViewResult Login(LoginViewModel lvm)
		{
			if (ModelState.IsValid)
			{
				if (Membership.ValidateUser(lvm.Email, lvm.Password))
				{
					FormsAuthentication.SetAuthCookie(lvm.Email, false);
					return PartialView("_LoginSuccess", lvm.Email);
				}
				ModelState.AddModelError("", "Incorrect email and/or password!");
			}
			return PartialView("_Login", lvm);
		}

		/// <summary>
		/// Register partial view
		/// </summary>
		/// <returns></returns>
		[HttpGet]
		public PartialViewResult Register()
		{
			return PartialView("_Register", new CreateAccountViewModel());
		}

		/// <summary>
		/// Regsiter partial view post
		/// </summary>
		/// <param name="vm"></param>
		/// <returns></returns>
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
					FormsAuthentication.SetAuthCookie(u.UserName, false);
					return PartialView("_RegisterSuccess", vm.Password);
				}
				ModelState.AddModelError("", "Can not create user! Please try again!");
			}
			return PartialView("_Register", vm);
		}

		
	}
}
