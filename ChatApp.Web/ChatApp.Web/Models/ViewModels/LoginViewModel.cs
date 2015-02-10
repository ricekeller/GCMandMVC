using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace ChatApp.Web.Models.ViewModels
{
	public class LoginViewModel
	{
		[Required(ErrorMessage="Email is required.")]
		[MinLength(6)]
		[EmailAddress(ErrorMessage="Invalid email address.")]
		public string Email { get; set; }
		[Required(ErrorMessage="Password is required.")]
		public string Password { get; set; }
		[Display(Name="Remember me?")]
		public bool RememberMe { get; set; }
	}
}