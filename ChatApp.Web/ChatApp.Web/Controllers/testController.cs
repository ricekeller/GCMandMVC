﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ChatApp.MongoDB.BI;
using ChatApp.MongoDB.BI.Model;

namespace ChatApp.Web.Controllers
{
    public class testController : Controller
    {
        //
        // GET: /test/

        public ActionResult Index()
        {
            var tu1= MessagePortalBI.GetUser("test1");
            var tu2 = MessagePortalBI.GetUser("test2");
            return View();
        }

    }
}
