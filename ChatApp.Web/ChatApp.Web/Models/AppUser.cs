using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatApp.Web.Models
{
    public class AppUser
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string RegistrationId { get; set; }

        public bool IsValid()
        {
            return !string.IsNullOrWhiteSpace(Id) && !string.IsNullOrWhiteSpace(Name) && !string.IsNullOrWhiteSpace(RegistrationId);
        }
    }
}