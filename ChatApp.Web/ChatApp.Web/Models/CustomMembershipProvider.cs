using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using System.Configuration.Provider;
using System.Diagnostics;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Security;
using ChatApp.Web.BL;
using ChatApp.Web.Properties;
using MongoDB.Driver;

namespace ChatApp.Web.Models
{
	public class CustomMembershipProvider:MembershipProvider
	{
		public const string DEFAULT_NAME = "MongoMembershipProvider";
		public const string DEFAULT_DATABASE_NAME = "test";
		public const string DEFAULT_USER_COLLECTION_SUFFIX = "users";
		public const string DEFAULT_INVALID_CHARACTERS = ",%";
		public const int NEW_PASSWORD_LENGTH = 8;
		public const int MAX_USERNAME_LENGTH = 256;
		public const int MAX_PASSWORD_LENGTH = 128;
		public const int MAX_PASSWORD_ANSWER_LENGTH = 128;
		public const int MAX_EMAIL_LENGTH = 256;
		public const int MAX_PASSWORD_QUESTION_LENGTH = 256;

		//
		// If false, exceptions are thrown to the caller. If true,
		// exceptions are written to the event log.
		//
		public bool WriteExceptionsToEventLog { get; set; }
		public string InvalidUsernameCharacters { get; protected set; }
		public string InvalidEmailCharacters { get; protected set; }
		public string CollectionName { get; protected set; }
		public MongoCollection<User> Collection { get; protected set; }
		public MongoDatabase Database { get; protected set; }

		// System.Web.Security.MembershipProvider properties.

		protected string _applicationName;
		protected bool _enablePasswordReset;
		protected bool _enablePasswordRetrieval;
		protected bool _requiresQuestionAndAnswer;
		protected bool _requiresUniqueEmail;
		protected int _maxInvalidPasswordAttempts;
		protected int _passwordAttemptWindow;
		protected MembershipPasswordFormat _passwordFormat;
		protected int _minRequiredNonAlphanumericCharacters;
		protected int _minRequiredPasswordLength;
		protected string _passwordStrengthRegularExpression;


		protected string _connectionString;
		protected string _collectionSuffix;

		protected string _eventSource = DEFAULT_NAME;
		protected string _eventLog = "Application";
		protected string _exceptionMessage = Resources.ProviderException;

		/// <summary>
		/// Initializes the provider.
		/// </summary>
		/// <param name="name">The friendly name of the provider.</param>
		/// <param name="config">A collection of the name/value pairs representing the provider-specific attributes specified in the configuration for this provider.</param>
		/// <exception cref="T:System.ArgumentNullException">
		/// The config collection provided is null.
		/// </exception>
		/// <exception cref="T:System.InvalidOperationException">
		/// An attempt is made to call <see cref="M:System.Configuration.Provider.ProviderBase.Initialize(System.String,System.Collections.Specialized.NameValueCollection)"/> on a provider after the provider has already been initialized.
		/// </exception>
		/// <exception cref="T:System.Configuration.Provider.ProviderException">
		/// </exception>
		public override void Initialize(string name, System.Collections.Specialized.NameValueCollection config)
		{
			if (null == config)
				throw new ArgumentNullException("config");

			if (String.IsNullOrWhiteSpace(name))
				name = DEFAULT_NAME;

			if (String.IsNullOrEmpty(config["description"]))
			{
				config.Remove("description");
				config.Add("description", Resources.MembershipProvider_description);
			}

			base.Initialize(name, config);

			// get config values

			_applicationName = config["applicationName"] ?? System.Web.Hosting.HostingEnvironment.ApplicationVirtualPath;
			_maxInvalidPasswordAttempts = Helper.GetConfigValue(config["maxInvalidPasswordAttempts"], 5);
			_passwordAttemptWindow = Helper.GetConfigValue(config["passwordAttemptWindow"], 10);
			_minRequiredNonAlphanumericCharacters = Helper.GetConfigValue(config["minRequiredNonAlphanumericCharacters"], 1);
			_minRequiredPasswordLength = Helper.GetConfigValue(config["minRequiredPasswordLength"], 7);
			_passwordStrengthRegularExpression = Helper.GetConfigValue(config["passwordStrengthRegularExpression"], "");
			_enablePasswordReset = Helper.GetConfigValue(config["enablePasswordReset"], true);
			_enablePasswordRetrieval = Helper.GetConfigValue(config["enablePasswordRetrieval"], false);
			_requiresQuestionAndAnswer = Helper.GetConfigValue(config["requiresQuestionAndAnswer"], false);
			_requiresUniqueEmail = Helper.GetConfigValue(config["requiresUniqueEmail"], true);
			InvalidUsernameCharacters = Helper.GetConfigValue(config["invalidUsernameCharacters"], DEFAULT_INVALID_CHARACTERS);
			InvalidEmailCharacters = Helper.GetConfigValue(config["invalidEmailCharacters"], DEFAULT_INVALID_CHARACTERS);
			WriteExceptionsToEventLog = Helper.GetConfigValue(config["writeExceptionsToEventLog"], true);
			_collectionSuffix = Helper.GetConfigValue(config["collectionSuffix"], DEFAULT_USER_COLLECTION_SUFFIX);

			ValidatePwdStrengthRegularExpression();

			if (_minRequiredNonAlphanumericCharacters > _minRequiredPasswordLength)
				throw new ProviderException(Resources.MinRequiredNonalphanumericCharacters_can_not_be_more_than_MinRequiredPasswordLength);

			string tempFormat = config["passwordFormat"] ?? "Hashed";

			switch (tempFormat.ToLowerInvariant())
			{
				case "hashed":
					_passwordFormat = MembershipPasswordFormat.Hashed;
					break;
				case "encrypted":
					_passwordFormat = MembershipPasswordFormat.Encrypted;
					break;
				case "clear":
					_passwordFormat = MembershipPasswordFormat.Clear;
					break;
				default:
					throw new ProviderException(Resources.Provider_bad_password_format);
			}

			if ((PasswordFormat == MembershipPasswordFormat.Hashed) && EnablePasswordRetrieval)
			{
				throw new ProviderException(Resources.Provider_can_not_retrieve_hashed_password);
			}

			// Initialize Connection String
			var temp = config["connectionStringName"];
			if (String.IsNullOrWhiteSpace(temp))
				throw new ProviderException(Resources.Connection_name_not_specified);

			var connectionStringSettings = ConfigurationManager.ConnectionStrings[temp];
			if (null == connectionStringSettings || String.IsNullOrWhiteSpace(connectionStringSettings.ConnectionString))
				throw new ProviderException(String.Format(Resources.Connection_string_not_found, temp));

			_connectionString = connectionStringSettings.ConnectionString;

			// Check for invalid parameters in the config

			config.Remove("connectionStringName");
			config.Remove("enablePasswordRetrieval");
			config.Remove("enablePasswordReset");
			config.Remove("requiresQuestionAndAnswer");
			config.Remove("applicationName");
			config.Remove("requiresUniqueEmail");
			config.Remove("maxInvalidPasswordAttempts");
			config.Remove("passwordAttemptWindow");
			config.Remove("commandTimeout");
			config.Remove("passwordFormat");
			config.Remove("name");
			config.Remove("minRequiredPasswordLength");
			config.Remove("minRequiredNonAlphanumericCharacters");
			config.Remove("passwordStrengthRegularExpression");
			config.Remove("writeExceptionsToEventLog");
			config.Remove("invalidUsernameCharacters");
			config.Remove("invalidEmailCharacters");
			config.Remove("collectionSuffix");

			if (config.Count > 0)
			{
				var key = config.GetKey(0);
				if (!string.IsNullOrEmpty(key))
				{
					throw new ProviderException(String.Format(Resources.Provider_unrecognized_attribute, key));
				}
			}

			// Initialize MongoDB Server
			Database = GetMongoConnection(_connectionString);
			CollectionName = Helper.GenerateCollectionName(_applicationName, _collectionSuffix);
			Collection = Database.GetCollection<User>(CollectionName);
		}
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
		/// Adds a new membership user to the data source.
		/// </summary>
		/// <param name="username">The user name for the new user.</param>
		/// <param name="password">The password for the new user.</param>
		/// <param name="email">The e-mail address for the new user.</param>
		/// <param name="passwordQuestion">The password question for the new user.</param>
		/// <param name="passwordAnswer">The password answer for the new user</param>
		/// <param name="isApproved">Whether or not the new user is approved to be validated.</param>
		/// <param name="providerUserKey">The unique identifier from the membership data source for the user.</param>
		/// <param name="status">A <see cref="T:System.Web.Security.MembershipCreateStatus"/> enumeration value indicating whether the user was created successfully.</param>
		/// <returns>
		/// A <see cref="T:System.Web.Security.MembershipUser"/> object populated with the information for the newly created user.
		/// </returns>
		public override MembershipUser CreateUser(string username, string password, string email, string passwordQuestion, string passwordAnswer, bool isApproved, object providerUserKey, out MembershipCreateStatus status)
		{
			#region Validation

			if (!SecUtility.ValidateParameter(ref username, true, true, InvalidUsernameCharacters, MAX_USERNAME_LENGTH))
			{
				status = MembershipCreateStatus.InvalidUserName;
				return null;
			}

			if (!SecUtility.ValidateParameter(ref email, this.RequiresUniqueEmail, this.RequiresUniqueEmail, InvalidEmailCharacters, MAX_EMAIL_LENGTH))
			{
				status = MembershipCreateStatus.InvalidEmail;
				return null;
			}

			if (!SecUtility.ValidateParameter(ref password, true, true, null, MAX_PASSWORD_LENGTH))
			{
				status = MembershipCreateStatus.InvalidPassword;
				return null;
			}

			if (password.Length > MAX_PASSWORD_LENGTH)
			{
				status = MembershipCreateStatus.InvalidPassword;
				return null;
			}

			if (null != passwordAnswer)
			{
				passwordAnswer = passwordAnswer.Trim();
			}

			if (string.IsNullOrEmpty(passwordAnswer))
			{
				if (RequiresQuestionAndAnswer)
				{
					status = MembershipCreateStatus.InvalidAnswer;
					return null;
				}
			}
			else
			{
				if (passwordAnswer.Length > MAX_PASSWORD_ANSWER_LENGTH)
				{
					status = MembershipCreateStatus.InvalidAnswer;
					return null;
				}
			}

			if (!SecUtility.ValidateParameter(ref passwordQuestion, this.RequiresQuestionAndAnswer, true, null, MAX_PASSWORD_QUESTION_LENGTH))
			{
				status = MembershipCreateStatus.InvalidQuestion;
				return null;
			}

			if ((null != providerUserKey) && !(providerUserKey is Guid))
			{
				status = MembershipCreateStatus.InvalidProviderUserKey;
				return null;
			}

			if (password.Length < this.MinRequiredPasswordLength)
			{
				status = MembershipCreateStatus.InvalidPassword;
				return null;
			}

			if (this.MinRequiredNonAlphanumericCharacters > 0)
			{
				int numNonAlphaNumericChars = 0;
				for (int i = 0; i < password.Length; i++)
				{
					if (!char.IsLetterOrDigit(password, i))
					{
						numNonAlphaNumericChars++;
					}
				}

				if (numNonAlphaNumericChars < this.MinRequiredNonAlphanumericCharacters)
				{
					status = MembershipCreateStatus.InvalidPassword;
					return null;
				}
			}

			if ((this.PasswordStrengthRegularExpression.Length > 0) && !Regex.IsMatch(password, this.PasswordStrengthRegularExpression))
			{
				status = MembershipCreateStatus.InvalidPassword;
				return null;
			}

			#endregion

			ValidatePasswordEventArgs args = new ValidatePasswordEventArgs(username, password, true);

			OnValidatingPassword(args);

			if (args.Cancel)
			{
				status = MembershipCreateStatus.InvalidPassword;
				return null;
			}

			if (RequiresUniqueEmail && !String.IsNullOrEmpty(GetUserNameByEmail(email)))
			{
				status = MembershipCreateStatus.DuplicateEmail;
				return null;
			}

			MembershipUser u = GetUser(username, false);
			if (null != u)
			{
				status = MembershipCreateStatus.DuplicateUserName;
				return null;
			}

			if (null == providerUserKey)
			{
				providerUserKey = Guid.NewGuid();
			}

			var createAt = DateTime.UtcNow;

			var answer = passwordAnswer;
			if (null != answer)
			{
				answer = PasswordSaltedHash.CreateHash(passwordAnswer.ToLowerInvariant());
			}

			var user = new User
			{
				Id = (Guid)providerUserKey,
				Username = username,
				LowercaseUsername = username.ToLowerInvariant(),
				DisplayName = username,
				Email = email,
				LowercaseEmail = (null == email) ? null : email.ToLowerInvariant(),
				Password = PasswordSaltedHash.CreateHash(password),
				PasswordQuestion = passwordQuestion,
				PasswordAnswer = answer,
				PasswordFormat = PasswordFormat,
				IsApproved = isApproved,
				LastPasswordChangedDate = DateTime.MinValue,
				CreateDate = createAt,
				IsLockedOut = false,
				LastLockedOutDate = DateTime.MinValue,
				LastActivityDate = createAt,
				FailedPasswordAnswerAttemptCount = 0,
				FailedPasswordAnswerAttemptWindowStart = DateTime.MinValue,
				FailedPasswordAttemptCount = 0,
				FailedPasswordAttemptWindowStart = DateTime.MinValue
			};

			var msg = String.Format("Error creating new User '{0}'", username);
			Save(user, msg, "CreateUser");

			status = MembershipCreateStatus.Success;
			return GetUser(username, false);
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

		/// <summary>
		/// 
		/// </summary>
		/// <param name="email"></param>
		/// <returns></returns>
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
		/// Gets the minimum length required for a password.
		/// </summary>
		/// <returns>
		/// The minimum length required for a password.
		/// </returns>
		public override int MinRequiredPasswordLength
		{
			get { return _minRequiredPasswordLength; }
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

		protected void ValidatePwdStrengthRegularExpression()
		{
			// Validate regular expression, if supplied.
			if (null == _passwordStrengthRegularExpression)
				_passwordStrengthRegularExpression = String.Empty;

			_passwordStrengthRegularExpression = _passwordStrengthRegularExpression.Trim();

			if (_passwordStrengthRegularExpression.Length <= 0)
				return;

			try
			{
				new Regex(_passwordStrengthRegularExpression);
			}
			catch (ArgumentException ex)
			{
				throw new ProviderException(ex.Message, ex);
			}
		}

		/// <summary>
		/// Gets the mongo connection.
		/// </summary>
		/// <param name="connectionString">The connection string.</param>
		/// <returns></returns>
		public static MongoDatabase GetMongoConnection(String connectionString)
		{
			UserClassMap.Register();
			var mongoUrl = MongoUrl.Create(connectionString);
			var server = new MongoClient(connectionString).GetServer();
			return server.GetDatabase(mongoUrl.DatabaseName);
		}

		/// <summary>
		/// Saves a User to persistent storage
		/// </summary>
		/// <param name="user">The User to save</param>
		/// <param name="failureMessage">A message that will be used if an exception is raised during save</param>
		/// <param name="action">The name of the action which attempted the save (ex. "CreateUser"). Used in case exceptions are written to EventLog.</param>
		protected void Save(User user, string failureMessage, string action)
		{
			WriteConcernResult result = null;
			try
			{
				var users = Collection;
				result = users.Save(user, WriteConcern.Acknowledged);
			}
			catch (Exception ex)
			{
				HandleDataExceptionAndThrow(new ProviderException(failureMessage, ex), action);
			}
			if (null == result)
			{
				HandleDataExceptionAndThrow(new ProviderException("Save to database did not return a status result"), action);
			}
			else if (!result.Ok)
			{
				HandleDataExceptionAndThrow(new ProviderException(result.LastErrorMessage), action);
			}
		}

		protected void HandleDataExceptionAndThrow(Exception ex, string action)
		{
			if (WriteExceptionsToEventLog)
			{
				WriteToEventLog(ex, action);

				throw new ProviderException(_exceptionMessage);
			}

			throw ex;
		}

		/// <summary>
		/// WriteToEventLog
		///   A helper function that writes exception detail to the event log. Exceptions
		/// are written to the event log as a security measure to avoid private database
		/// details from being returned to the browser. If a method does not return a status
		/// or boolean indicating the action succeeded or failed, a generic exception is also 
		/// thrown by the caller.
		/// </summary>
		/// <param name="ex"></param>
		/// <param name="action"></param>
		protected void WriteToEventLog(Exception ex, string action)
		{
			EventLog log = new EventLog { Source = _eventSource, Log = _eventLog };

			string message = "An exception occurred communicating with the data source.\n\n";
			message += "Action: " + action + "\n\n";
			message += "Exception: " + ex.ToString();

			log.WriteEntry(message);
		}
	}
}