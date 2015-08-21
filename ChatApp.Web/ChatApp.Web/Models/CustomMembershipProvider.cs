using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Security;

namespace ChatApp.Web.Models
{
	public class CustomMembershipProvider:MembershipProvider
	{
		public override string ApplicationName
		{
			get
			{
				throw new NotImplementedException();
			}
			set
			{
				throw new NotImplementedException();
			}
		}

		public override bool ChangePassword(string username, string oldPassword, string newPassword)
		{
			throw new NotImplementedException();
		}

		public override bool ChangePasswordQuestionAndAnswer(string username, string password, string newPasswordQuestion, string newPasswordAnswer)
		{
			throw new NotImplementedException();
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="username"></param>
		/// <param name="password"></param>
		/// <param name="email"></param>
		/// <param name="passwordQuestion"></param>
		/// <param name="passwordAnswer"></param>
		/// <param name="isApproved"></param>
		/// <param name="providerUserKey"></param>
		/// <param name="status"></param>
		/// <returns></returns>
		public override MembershipUser CreateUser(string username, string password, string email, string passwordQuestion, string passwordAnswer, bool isApproved, object providerUserKey, out MembershipCreateStatus status)
		{
			if(!ValidateUserName(username))
			{
				status = MembershipCreateStatus.InvalidUserName;
				return null;
			}
			if(!ValidatePassword(password))
			{
				status = MembershipCreateStatus.InvalidPassword;
				return null;
			}
			if (!ValidateEmail(email))
			{
				status = MembershipCreateStatus.InvalidEmail;
				return null;
			}
			throw new NotImplementedException();
		}

		public override bool DeleteUser(string username, bool deleteAllRelatedData)
		{
			throw new NotImplementedException();
		}

		public override bool EnablePasswordReset
		{
			get { throw new NotImplementedException(); }
		}

		public override bool EnablePasswordRetrieval
		{
			get { throw new NotImplementedException(); }
		}

		public override MembershipUserCollection FindUsersByEmail(string emailToMatch, int pageIndex, int pageSize, out int totalRecords)
		{
			throw new NotImplementedException();
		}

		public override MembershipUserCollection FindUsersByName(string usernameToMatch, int pageIndex, int pageSize, out int totalRecords)
		{
			throw new NotImplementedException();
		}

		public override MembershipUserCollection GetAllUsers(int pageIndex, int pageSize, out int totalRecords)
		{
			throw new NotImplementedException();
		}

		public override int GetNumberOfUsersOnline()
		{
			throw new NotImplementedException();
		}

		public override string GetPassword(string username, string answer)
		{
			throw new NotImplementedException();
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="username"></param>
		/// <param name="userIsOnline"></param>
		/// <returns></returns>
		public override MembershipUser GetUser(string username, bool userIsOnline)
		{
			throw new NotImplementedException();
		}

		public override MembershipUser GetUser(object providerUserKey, bool userIsOnline)
		{
			throw new NotImplementedException();
		}

		public override string GetUserNameByEmail(string email)
		{
			throw new NotImplementedException();
		}

		public override int MaxInvalidPasswordAttempts
		{
			get { throw new NotImplementedException(); }
		}

		public override int MinRequiredNonAlphanumericCharacters
		{
			get { throw new NotImplementedException(); }
		}

		/// <summary>
		/// 
		/// </summary>
		public override int MinRequiredPasswordLength
		{
			get { throw new NotImplementedException(); }
		}

		public override int PasswordAttemptWindow
		{
			get { throw new NotImplementedException(); }
		}

		public override MembershipPasswordFormat PasswordFormat
		{
			get { throw new NotImplementedException(); }
		}

		public override string PasswordStrengthRegularExpression
		{
			get { throw new NotImplementedException(); }
		}

		public override bool RequiresQuestionAndAnswer
		{
			get { throw new NotImplementedException(); }
		}

		/// <summary>
		/// 
		/// </summary>
		public override bool RequiresUniqueEmail
		{
			get { throw new NotImplementedException(); }
		}

		public override string ResetPassword(string username, string answer)
		{
			throw new NotImplementedException();
		}

		public override bool UnlockUser(string userName)
		{
			throw new NotImplementedException();
		}

		public override void UpdateUser(MembershipUser user)
		{
			throw new NotImplementedException();
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="username"></param>
		/// <param name="password"></param>
		/// <returns></returns>
		public override bool ValidateUser(string username, string password)
		{
			throw new NotImplementedException();
		}

		private bool ValidateUserName(string username)
		{
			if(string.IsNullOrWhiteSpace(username))
			{
				return false;
			}
			if(!ValidateEmail(username))
			{
				return false;
			}
			RangeAttribute ra = new RangeAttribute(5, 100);
			if(!ra.IsValid(username))
			{
				return false;
			}
			return true;
		}

		private bool ValidatePassword(string pwd)
		{
			if (string.IsNullOrWhiteSpace(pwd))
			{
				return false;
			}
			throw new NotImplementedException();
		}

		private bool ValidateEmail(string email)
		{
			if (string.IsNullOrWhiteSpace(email))
			{
				return false;
			}
			EmailAddressAttribute eaa = new EmailAddressAttribute();
			if(!eaa.IsValid(email))
			{
				return false;
			}
			return true;
		}
	}
}