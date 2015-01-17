using System.IO;
using System.Net;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using MvcApplication1.Models;

namespace MvcApplication1.Controllers
{
    public class HomeController : Controller
    {
        //
        // GET: /Home/

        public ActionResult Index()
        {
			var data = new StreamReader(Request.InputStream).ReadToEnd();
            return View();
        }

		public FileStreamResult GetFile()
		{
			string dir = Server.MapPath(Url.Content("~/Content/1.mp3"));
			return new FileStreamResult(new FileStream(dir, FileMode.Open), "audio/mpeg3");
		}

		public string TestGCM()
		{
			//GCMServerHelper.GetInstance().IsRegistrationIdValid("4455");
			return GCMServerHelper.GetInstance().SendMessage("Test!!!","1234");
		}

		public string TestSA(string id)
		{
			return GCMServerHelper.GetInstance().SaveAPIKEY2File(id, Server).ToString();
		}

		public string TestLA()
		{
			 return GCMServerHelper.GetInstance().LoadAPIKEYFromFile(Server).ToString();
		}

		public string testen(string id)
		{
			string encrypted=Utils.EncryptString(id);
			string decrypted=Utils.DecryptString(encrypted);
			return string.Format("Original: {0}, encrypted: {1}, decrypted: {2}", id, encrypted, decrypted);
		}
    }
}
