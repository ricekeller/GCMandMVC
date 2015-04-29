using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ChatApp.Web.BL;

namespace ChatApp.Web.Controllers
{
    public class MediaController : Controller
    {
        //
        // GET: /Media/

        public PartialViewResult Index()
        {
			return PartialView();
        }

        public PartialViewResult PhotoViewer()
        {
            return PartialView(MediaBI.GetPhotoSets());
        }

        public JsonResult ListPhotosets()
        {
            return Json(MediaBI.GetPhotoSets(), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetPhotoset(string setID)
        {
            return Json(MediaBI.GetPhotoSet(setID), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetAllPhotosInSet(string setID)
        {
            return Json(MediaBI.GetPhotosInSet(setID),JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetPhotosInSet(string setID,int page)
        {
            return Json(MediaBI.GetPhotosInSet(setID, page), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetPhotoInfo(string photoID)
        {
            return Json(MediaBI.GetPhotoInfo(photoID), JsonRequestBehavior.AllowGet);
        }
    }
}
