using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ChatApp.Model;
using ChatApp.Web.BL;

namespace ChatApp.Web.Controllers
{
    public class LocationController : Controller
    {
        public PartialViewResult CurrentLocation()
        {
            LocationTrail loc = LocationBI.GetLastLoc();
            return PartialView("_CurrentLocation",loc);
        }

        [HttpPost]
        public JsonResult SaveLocation(LocationTrail loc)
        {
            return Json(new { result=LocationBI.SaveLoc(loc) });
        }
    }
}
