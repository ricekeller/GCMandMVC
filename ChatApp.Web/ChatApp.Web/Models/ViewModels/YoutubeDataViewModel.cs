using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Google.Apis.YouTube.v3.Data;

namespace ChatApp.Web.Models.ViewModels
{
	public class YoutubeDataViewModel
	{
		public YoutubeDataViewModel()
		{
			Data = new Dictionary<string, YoutubePlaylist>();
		}
		public Dictionary<string, YoutubePlaylist> Data { get; set; }
	}

	public class YoutubePlaylist
	{
		public string Id { get; set; }
		public Playlist Playlist { get; set; }
		public IList<PlaylistItem> Videos { get; set; }
	}
}