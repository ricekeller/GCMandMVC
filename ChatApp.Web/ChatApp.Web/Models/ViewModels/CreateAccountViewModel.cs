using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using ChatApp.Web.BL;

namespace ChatApp.Web.Models.ViewModels
{
	public class CreateAccountViewModel : IValidatableObject
	{
		[Required]
		[EmailAddress(ErrorMessage = "Invalid email address.")]
		public string Email { get; set; }

		[Required]
		public string Password { get; set; }

		[Required]
		[Display(Name = "Confirm Password")]
		[Compare("Password", ErrorMessage = "Provided passwords are not same!")]
		public string ConfirmPassword { get; set; }

		//[Display(Name = "Display Name")]
		//[MaxLength(20)]
		//[MinLength(2)]
		//public string DisplayName { get; set; }

		public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
		{
			var validPwd = Password.Length > 6 && Password.Where(Char.IsDigit).Count() >= 3
				&& Password.Where(Char.IsLetter).Count() >= 3;
			if (!validPwd)
			{
				yield return new ValidationResult("Password's length should be at least 6 and contains at least 3 numbers and 3 letters and 1 special character.", new string[] { "Password" });
			}
		}
	}
}