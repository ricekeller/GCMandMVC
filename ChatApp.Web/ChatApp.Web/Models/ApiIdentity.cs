using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Web;

namespace ChatApp.Web.Models
{
	public class ApiIdentity:IIdentity
	{
		public CustomMembershipUser User { get; private set; }

		public ApiIdentity(CustomMembershipUser user)
		{
			if (user == null)
				throw new ArgumentNullException("user");

			this.User = user;
		}
		public string AuthenticationType
		{
			get { return "Api"; }
		}

		public bool IsAuthenticated
		{
			get { return true; }
		}

		public string Name
		{
			get { throw new NotImplementedException(); }
		}
	}
}