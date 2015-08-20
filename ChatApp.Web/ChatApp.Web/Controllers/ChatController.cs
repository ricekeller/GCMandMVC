using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ChatApp.Web.Models.Chat;
using ChatApp.Web.Models.ViewModels;

namespace ChatApp.Web.Controllers
{
    public class ChatController : Controller
    {
        //
        // GET: /Chat/

        public ActionResult Index()
        {
            return View();
        }

		public JsonResult GetDashboardInfo()
		{
			return Json(new ChatDashboardViewModel(){NumofRooms=ChatCenter.GetNumberOfRooms(),NumofUsers=ChatCenter.GetNumberOfUsers()},JsonRequestBehavior.AllowGet);
		}

		[HttpPost]
		public JsonResult CreateRoom(CreateChatroomViewModel m)
		{
			string rId=string.Empty;
			ChatCenter.CreateRoom(m.IsPrivate,m.Password,out rId);
			return Json(rId);
		}
    }
}
