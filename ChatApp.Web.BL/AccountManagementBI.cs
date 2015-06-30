using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ChatApp.Model;
using ChatApp.MongoDB;

namespace ChatApp.Web.BL
{
	public static class AccountManagementBI
	{
		private const string s_CollectionName = "UserAccounts";
		public static bool IsUserExist(string email)
		{
			var u = DB.Instance().GetOne<UserAccount>(s_CollectionName, a => a.Email.Equals(email), a => a.Email);
			return null != u;
		}

		public static bool CreateAccount(UserAccount a)
		{
			return false;
		}
	}
}
