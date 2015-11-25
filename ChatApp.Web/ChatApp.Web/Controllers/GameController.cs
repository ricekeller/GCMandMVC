using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using ChatApp.Web.Models;

namespace ChatApp.Web.Controllers
{
	public class GameController : Controller
	{
		//
		// GET: /Game/

		public ActionResult Index()
		{
			return View();
		}

		public ActionResult MineSweeper()
		{
			return View();
		}

		public ActionResult Hanoi()
		{
			return View();
		}

		public ActionResult Sokoban()
		{
			List<SokobanLevel> lvls = SokobanUtils.GetAll();
			return View(lvls);
		}

		[Authorize]
		public ActionResult SokobanLevelUpload()
		{
			return View();
		}
		[Authorize]
		[HttpPost]
		public ActionResult SokobanLevelUpload(string levelText)
		{
			//process
			Regex r = new Regex(@"(Level )\d+");
			MatchCollection mc = r.Matches(levelText);
			string oneLvl = null;
			string[] pieces = null;
			SokobanLevel lvl = null;
			for (int i = 0; i < mc.Count - 1; i++)
			{
				oneLvl = levelText.Substring(mc[i].Index, mc[i + 1].Index - mc[i].Index);
				pieces = oneLvl.Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries);
				lvl = new SokobanLevel() { LevelData = pieces };
				SokobanUtils.Save(lvl);
			}
			//last one
			oneLvl = levelText.Substring(mc[mc.Count - 1].Index);
			pieces = oneLvl.Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries);
			lvl = new SokobanLevel() { LevelData = pieces };
			SokobanUtils.Save(lvl);
			return RedirectToAction("SokobanLevelUpload");
		}
	}
}
