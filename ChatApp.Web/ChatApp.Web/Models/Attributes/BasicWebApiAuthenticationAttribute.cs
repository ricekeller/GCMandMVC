using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Web;
using System.Web.Http.Filters;
using System.Web.Security;

namespace ChatApp.Web.Models.Attributes
{
	public class BasicWebApiAuthenticationAttribute : ActionFilterAttribute
	{
		public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
		{
			if (actionContext.Request.Headers.Authorization == null)
			{
				actionContext.Response = new System.Net.Http.HttpResponseMessage(System.Net.HttpStatusCode.Unauthorized);
			}
			else
			{
				string authToken = actionContext.Request.Headers.Authorization.Parameter;
				string decodedToken = Encoding.UTF8.GetString(Convert.FromBase64String(authToken));

				string username = decodedToken.Substring(0, decodedToken.IndexOf(":"));
				string password = decodedToken.Substring(decodedToken.IndexOf(":") + 1);
				if(!Membership.ValidateUser(username,password))
				{
					actionContext.Response = new System.Net.Http.HttpResponseMessage(System.Net.HttpStatusCode.Unauthorized);
				}
				HttpContext.Current.User = new GenericPrincipal(new ApiIdentity(Membership.GetUser(username) as CustomMembershipUser), new string[] { });

				base.OnActionExecuting(actionContext);
			}
		}
	}
}