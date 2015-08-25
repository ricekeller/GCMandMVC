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
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using MongoDB.Driver.Builders;
using MongoDB.Driver.Linq;

namespace ChatApp.Web.Models
{
	public class CustomMembershipProvider : MembershipProvider
	{
		public const string DEFAULT_NAME = "MongoMembershipProvider";
		public const string DEFAULT_DATABASE_NAME = "test";
		public const string DEFAULT_USER_COLLECTION_SUFFIX = "Users";
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

		public struct MembershipElements
		{
			public string LowercaseUsername;
			public string LowercaseEmail;
			public string LastActivityDate;
		}

		public MembershipElements ElementNames { get; protected set; }

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
			CollectionName = _collectionSuffix;
			Collection = Database.GetCollection<User>(CollectionName);
		}
		public override string ApplicationName
		{
			get
			{
				return _applicationName;
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
			get { return _enablePasswordReset; }
		}

		public override bool EnablePasswordRetrieval
		{
			get { return _enablePasswordRetrieval; }
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
		/// Gets information from the data source for a user. Provides an option to update the last-activity date/time stamp for the user.
		/// </summary>
		/// <param name="username">The name of the user to get information for.</param>
		/// <param name="userIsOnline">true to update the last-activity date/time stamp for the user; false to return user information without updating the last-activity date/time stamp for the user.</param>
		/// <returns>
		/// A <see cref="T:System.Web.Security.MembershipUser"/> object populated with the specified user's information from the data source.
		/// </returns>
		public override MembershipUser GetUser(string username, bool userIsOnline)
		{
			if (String.IsNullOrWhiteSpace(username)) return null;

			if (userIsOnline)
			{
				// update the last-activity date
				var users = Collection;
				var map = BsonClassMap.LookupClassMap(typeof(User));
				var query = Query.EQ(ElementNames.LowercaseUsername, username.ToLowerInvariant());
				var update = Update.Set(ElementNames.LastActivityDate, DateTime.UtcNow);
				var result = users.FindAndModify(query, SortBy.Null, update, returnNew: true);
				if (!result.Ok)
				{
					HandleDataExceptionAndThrow(new ProviderException(result.ErrorMessage), "GetUser");
				}
				var user = BsonSerializer.Deserialize<User>(result.ModifiedDocument);
				return ToMembershipUser(user);
			}
			else
			{
				User user = Collection.AsQueryable().FirstOrDefault(u => u.LowercaseUsername == username.ToLowerInvariant());
				return ToMembershipUser(user);
			}
		}

		/// <summary>
		/// Gets user information from the data source based on the unique identifier for the membership user. Provides an option to update the last-activity date/time stamp for the user.
		/// </summary>
		/// <param name="providerUserKey">The unique identifier for the membership user to get information for.</param>
		/// <param name="userIsOnline">true to update the last-activity date/time stamp for the user; false to return user information without updating the last-activity date/time stamp for the user.</param>
		/// <returns>
		/// A <see cref="T:System.Web.Security.MembershipUser"/> object populated with the specified user's information from the data source.
		/// </returns>
		public override MembershipUser GetUser(object providerUserKey, bool userIsOnline)
		{
			if (!(providerUserKey is Guid))
			{
				throw new ArgumentException(Resources.Membership_InvalidProviderUserKey, "providerUserKey");
			}
			if (userIsOnline)
			{
				// update the last-activity date
				var query = Query.EQ("_id", (Guid)providerUserKey);
				var update = Update.Set(ElementNames.LastActivityDate, DateTime.UtcNow);
				var result = Collection.FindAndModify(query, SortBy.Null, update, returnNew: true);
				if (!result.Ok)
				{
					HandleDataExceptionAndThrow(new ProviderException(result.ErrorMessage), "GetUser");
				}
				var user = BsonSerializer.Deserialize<User>(result.ModifiedDocument);
				return ToMembershipUser(user);
			}
			else
			{
				User user = Collection.AsQueryable().FirstOrDefault(u => u.Id == (Guid)providerUserKey);
				return ToMembershipUser(user);
			}
		}

		/// <summary>
		/// Gets the user name associated with the specified e-mail address.
		/// </summary>
		/// <param name="email">The e-mail address to search for.</param>
		/// <returns>
		/// The user name associated with the specified e-mail address. If no match is found, return null.
		/// </returns>
		public override string GetUserNameByEmail(string email)
		{
			if (null == email)
				return null;

			var username = Collection.AsQueryable().Where(u => u.LowercaseEmail == email.ToLowerInvariant()).Select(u => u.Username).FirstOrDefault();
			return username;
		}

		public override int MaxInvalidPasswordAttempts
		{
			get { return _maxInvalidPasswordAttempts; }
		}

		public override int MinRequiredNonAlphanumericCharacters
		{
			get { return _minRequiredNonAlphanumericCharacters; }
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
			get { return _passwordAttemptWindow; }
		}

		public override MembershipPasswordFormat PasswordFormat
		{
			get { return _passwordFormat; }
		}

		public override string PasswordStrengthRegularExpression
		{
			get { return _passwordStrengthRegularExpression; }
		}

		public override bool RequiresQuestionAndAnswer
		{
			get { return _requiresQuestionAndAnswer; }
		}

		/// <summary>
		/// 
		/// </summary>
		public override bool RequiresUniqueEmail
		{
			get { return _requiresUniqueEmail; }
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
		/// Verifies that the specified user name and password exist in the data source.
		/// </summary>
		/// <param name="username">The name of the user to validate.</param>
		/// <param name="password">The password for the specified user.</param>
		/// <returns>
		/// true if the specified username and password are valid; otherwise, false.
		/// </returns>
		public override bool ValidateUser(string username, string password)
		{
			if (!SecUtility.ValidateParameter(ref username, true, true, InvalidUsernameCharacters, MAX_USERNAME_LENGTH) || !SecUtility.ValidateParameter(ref password, true, true, null, MAX_PASSWORD_LENGTH))
			{
				return false;
			}

			User user = GetUserByName(username, "ValidateUser");
			if (null == user || user.IsLockedOut || !user.IsApproved)
			{
				return false;
			}


			bool passwordsMatch = ComparePasswords(password, user.Password, user.PasswordFormat);
			if (!passwordsMatch)
			{
				// update invalid try count
				UpdateFailureCount(user, "password", isAuthenticated: false);
				return false;
			}

			// User is authenticated. Update last activity and last login dates and failure counts.

			user.LastActivityDate = DateTime.UtcNow;
			user.LastLoginDate = DateTime.UtcNow;
			user.FailedPasswordAnswerAttemptCount = 0;
			user.FailedPasswordAttemptCount = 0;
			user.FailedPasswordAnswerAttemptWindowStart = DateTime.MinValue;
			user.FailedPasswordAttemptWindowStart = DateTime.MinValue;

			var msg = String.Format("Error updating User '{0}'s last login date while validating", username);
			Save(user, msg, "ValidateUser");
			return true;
		}

		private bool ValidateUserName(string username)
		{
			if (string.IsNullOrWhiteSpace(username))
			{
				return false;
			}
			if (!ValidateEmail(username))
			{
				return false;
			}
			RangeAttribute ra = new RangeAttribute(5, 100);
			if (!ra.IsValid(username))
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
			if (!eaa.IsValid(email))
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

		protected MembershipUser ToMembershipUser(User user)
		{
			if (null == user)
				return null;

			return new MembershipUser(this.Name, user.Username, user.Id, user.Email,
				user.PasswordQuestion, user.Comment, user.IsApproved, user.IsLockedOut,
				user.CreateDate, user.LastLoginDate, user.LastActivityDate, user.LastPasswordChangedDate,
				user.LastLockedOutDate
			);
		}

		/// <summary>
		/// Convenience method that handles errors when retrieving a User
		/// </summary>
		/// <param name="username">The name of the user to retrieve</param>
		/// <param name="action">The name of the action that attempted the retrieval. Used in case exceptions are raised and written to EventLog</param>
		/// <returns></returns>
		protected User GetUserByName(string username, string action)
		{
			if (String.IsNullOrWhiteSpace(username))
			{
				return null;
			}

			User user = null;

			try
			{
				user = Collection.AsQueryable().SingleOrDefault(u => u.LowercaseUsername == username.ToLowerInvariant());
			}
			catch (Exception ex)
			{
				var msg = String.Format("Unable to retrieve User information for user '{0}'", username);
				HandleDataExceptionAndThrow(new ProviderException(msg, ex), action);
			}

			return user;
		}

		/// <summary>
		/// A helper method that performs the checks and updates associated User with password failure tracking
		/// </summary>
		/// <param name="username"></param>
		/// <param name="failureType"></param>
		/// <param name="isAuthenticated"></param>
		protected void UpdateFailureCount(User user, string failureType, bool isAuthenticated)
		{
			if (!((failureType == "password") || (failureType == "passwordAnswer")))
			{
				throw new ArgumentException("Invalid value for failureType parameter. Must be 'password' or 'passwordAnswer'.", "failureType");
			}

			if (user.IsLockedOut)
				return; // Just exit without updating any fields if user is locked out


			if (isAuthenticated)
			{
				// User is valid, so make sure Attempt Counts and IsLockedOut fields have been reset
				if ((user.FailedPasswordAttemptCount > 0) || (user.FailedPasswordAnswerAttemptCount > 0))
				{
					user.FailedPasswordAnswerAttemptCount = 0;
					user.FailedPasswordAttemptCount = 0;
					user.FailedPasswordAnswerAttemptWindowStart = DateTime.MinValue;
					user.FailedPasswordAttemptWindowStart = DateTime.MinValue;
					var msg = String.Format("Unable to reset Authenticated User's FailedPasswordAttemptCount property for user '{0}'", user.Username);
					Save(user, msg, "UpdateFailureCount");
				}
				return;
			}



			// If we get here that means isAuthenticated = false, which means the user did not log on successfully.
			// Log the failure and possibly lock out the user if she exceeded the number of allowed attempts.

			DateTime windowStart = DateTime.MinValue;
			int failureCount = 0;

			switch (failureType)
			{
				case "password":
					windowStart = user.FailedPasswordAttemptWindowStart;
					failureCount = user.FailedPasswordAttemptCount;
					break;
				case "passwordAnswer":
					windowStart = user.FailedPasswordAnswerAttemptWindowStart;
					failureCount = user.FailedPasswordAnswerAttemptCount;
					break;
				default:
					break;
			}

			DateTime windowEnd = windowStart.AddMinutes(PasswordAttemptWindow);

			if (failureCount == 0 || DateTime.UtcNow > windowEnd)
			{
				// First password failure or outside of PasswordAttemptWindow. 
				// Start a new password failure count from 1 and a new window starting now.

				switch (failureType)
				{
					case "password":
						user.FailedPasswordAttemptCount = 1;
						user.FailedPasswordAttemptWindowStart = DateTime.UtcNow;
						break;
					case "passwordAnswer":
						user.FailedPasswordAnswerAttemptCount = 1;
						user.FailedPasswordAnswerAttemptWindowStart = DateTime.UtcNow;
						break;
				}

				var msg = String.Format("Unable to update failure count and window start for user '{0}'", user.Username);
				Save(user, msg, "UpdateFailureCount");

				return;
			}


			// within PasswordAttemptWindow

			failureCount++;

			if (failureCount >= MaxInvalidPasswordAttempts)
			{
				// Password attempts have exceeded the failure threshold. Lock out the user.
				user.IsLockedOut = true;
				user.LastLockedOutDate = DateTime.UtcNow;
				user.FailedPasswordAttemptCount = failureCount;

				var msg = String.Format("Unable to lock out user '{0}'", user.Username);
				Save(user, msg, "UpdateFailureCount");

				return;
			}


			// Password attempts have not exceeded the failure threshold. Update
			// the failure counts. Leave the window the same.

			switch (failureType)
			{
				case "password":
					user.FailedPasswordAttemptCount = failureCount;
					break;
				case "passwordAnswer":
					user.FailedPasswordAnswerAttemptCount = failureCount;
					break;
			}

			{
				var msg = String.Format("Unable to update failure count for user '{0}'", user.Username);
				Save(user, msg, "UpdateFailureCount");
			}
		}

		protected bool ComparePasswords(string password, string dbpassword, MembershipPasswordFormat passwordFormat)
		{
			//   Compares password values based on the MembershipPasswordFormat.
			string pass1 = password;
			string pass2 = dbpassword;

			switch (passwordFormat)
			{
				case MembershipPasswordFormat.Encrypted:
					//pass2 = UnEncodePassword(dbpassword, passwordFormat);
					break;
				case MembershipPasswordFormat.Hashed:
					return PasswordSaltedHash.ValidatePassword(password, dbpassword);
				default:
					break;
			}

			return pass1 == pass2;
		}
	}
}