using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

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

    }
}
