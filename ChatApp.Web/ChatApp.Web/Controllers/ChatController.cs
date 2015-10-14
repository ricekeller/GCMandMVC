using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ChatApp.Web.Models.Chat;
using ChatApp.Web.Models.ViewModels;

namespace ChatApp.Web.Controllers
{
	[Authorize]
	[ValidateAntiForgeryToken]
	public class ChatController : Controller
	{
		public ActionResult Index()
		{
			return View(ChatCenter.GetRooms());
		}

		public JsonResult GetDashboardInfo()
		{
			return Json(new ChatDashboardViewModel() { NumofRooms = ChatCenter.GetNumberOfRooms(), NumofUsers = ChatCenter.GetNumberOfUsers() }, JsonRequestBehavior.AllowGet);
		}

		[HttpPost]
		public JsonResult CreateRoom(CreateChatroomViewModel m)
		{
			string rId = string.Empty;
			ChatCenter.CreateRoom(m.IsPrivate, m.Password, out rId);
			return Json(rId);
		}

		public ActionResult JoinRoom(string rId)
		{
			if (ChatCenter.AddUserToRoom(HttpContext.User.Identity.Name, rId))
			{
				return RedirectToAction("InRoom");
			}
			else
			{
				return RedirectToAction("Index");
			}
		}

		public ActionResult InRoom()
		{
			string uId = HttpContext.User.Identity.Name;
			return View(ChatCenter.GetRoomsUserIn(uId));
		}

		[HttpPost]
		public JsonResult PostMessage(string message, string rId)
		{
			Message m=new Message();
			m.Timestamp = DateTime.Now.ToLongDateString();
			m.Sender = HttpContext.User.Identity.Name;
			m.MessageContent = message;
			bool res=ChatCenter.SendMessageToRoom(m, rId);
			return Json(new JsonResponse<int>() { Success = res });
		}
	}
}
