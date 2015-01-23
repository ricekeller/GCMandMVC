using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatApp.MongoDB
{
    public enum ResponseStatus
    {
        Success,
        Fail
    }
    public class Response
    {
        public string Status;
    }
}
