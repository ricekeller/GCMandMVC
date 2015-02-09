using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace testAjaxReturn.Models
{
	public class CheckAjaxRequestAttribute : ActionFilterAttribute
	{
		private const string AJAX_HEADER = "X-Requested-With";

		public override void OnActionExecuting(ActionExecutingContext filterContext)
		{
			bool isAjaxRequest = filterContext.HttpContext.Request.Headers[AJAX_HEADER] != null;
			if (!isAjaxRequest)
			{
				filterContext.Result = new ViewResult { ViewName = "Unauthorized" };
			}
		}
	}
}