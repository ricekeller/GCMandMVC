using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace ChatApp.Web.Models.ViewModels
{
	public class CreateAccountViewModel:IValidatableObject
	{
		[Required]
		[MinLength(6)]
		[EmailAddress(ErrorMessage = "Invalid email address.")]
		public string Email { get; set; }

		[Required]
		public string Password { get; set; }

		[Required]
		[Display(Name="Confirm Password")]
		public string ConfirmPassword { get; set; }

		[Display(Name="Display Name")]
		[Range(2,20)]
		public string DisplayName { get; set; }

		public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
		{
			if(null!=Password&&null!=ConfirmPassword&&!Password.Equals(ConfirmPassword))
			{
				yield return new ValidationResult("Confirm password is not the same with password", new string[] { "ConfirmPassword" });
			}
		}
	}
}