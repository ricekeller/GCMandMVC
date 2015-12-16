using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using ChatApp.Web.Models.ViewModels;
using Google.Apis.Services;
using Google.Apis.YouTube.v3;
using Google.Apis.YouTube.v3.Data;

namespace ChatApp.Web.Models
{
	public static class Utils
	{
		public static TimeSpan Diff(DateTime date1, DateTime date2)
		{
			return date2.Subtract(date1);
		}

		public static bool IsBackoffTimePassed(DateTime date, int backoffSeconds)
		{
			return DateTime.Now.Subtract(date).TotalSeconds > backoffSeconds;
		}

		public static string EncryptString(string toEncript)
		{
			byte[] original = Encoding.Unicode.GetBytes(toEncript);
			byte[] encrypted;
			//Create a new instance of RSACryptoServiceProvider to generate 
			//public and private key data. 
			using (RSACryptoServiceProvider RSA = new RSACryptoServiceProvider())
			{

				//Pass the data to ENCRYPT, the public key information  
				//(using RSACryptoServiceProvider.ExportParameters(false), 
				//and a boolean flag specifying no OAEP padding.
				encrypted = RSAEncrypt(original, RSA.ExportParameters(false), false);

				//Display the decrypted plaintext to the console. 
				Console.WriteLine("encripted plaintext: {0}", Encoding.Unicode.GetString(encrypted));
			}
			return Encoding.Unicode.GetString(encrypted);
		}
		public static string DecryptString(string toDecrypt)
		{
			byte[] encrypted = Encoding.Unicode.GetBytes(toDecrypt);
			byte[] original;
			using (RSACryptoServiceProvider RSA = new RSACryptoServiceProvider())
			{
				//Pass the data to DECRYPT, the private key information  
				//(using RSACryptoServiceProvider.ExportParameters(true), 
				//and a boolean flag specifying no OAEP padding.
				original = RSADecrypt(encrypted, RSA.ExportParameters(true), false);

				//Display the decrypted plaintext to the console. 
				Console.WriteLine("original plaintext: {0}", Encoding.Unicode.GetString(original));
			}
			return Encoding.Unicode.GetString(original);
		}
		private static byte[] RSAEncrypt(byte[] DataToEncrypt, RSAParameters RSAKeyInfo, bool DoOAEPPadding)
		{
			try
			{
				byte[] encryptedData;
				//Create a new instance of RSACryptoServiceProvider. 
				using (RSACryptoServiceProvider RSA = new RSACryptoServiceProvider())
				{

					//Import the RSA Key information. This only needs 
					//toinclude the public key information.
					RSA.ImportParameters(RSAKeyInfo);

					//Encrypt the passed byte array and specify OAEP padding.   
					//OAEP padding is only available on Microsoft Windows XP or 
					//later.  
					encryptedData = RSA.Encrypt(DataToEncrypt, DoOAEPPadding);
				}
				return encryptedData;
			}
			//Catch and display a CryptographicException   
			//to the console. 
			catch (CryptographicException e)
			{
				Console.WriteLine(e.Message);

				return null;
			}

		}

		private static byte[] RSADecrypt(byte[] DataToDecrypt, RSAParameters RSAKeyInfo, bool DoOAEPPadding)
		{
			try
			{
				byte[] decryptedData;
				//Create a new instance of RSACryptoServiceProvider. 
				using (RSACryptoServiceProvider RSA = new RSACryptoServiceProvider())
				{
					//Import the RSA Key information. This needs 
					//to include the private key information.
					RSA.ImportParameters(RSAKeyInfo);

					//Decrypt the passed byte array and specify OAEP padding.   
					//OAEP padding is only available on Microsoft Windows XP or 
					//later.  
					decryptedData = RSA.Decrypt(DataToDecrypt, DoOAEPPadding);
				}
				return decryptedData;
			}
			//Catch and display a CryptographicException   
			//to the console. 
			catch (CryptographicException e)
			{
				Console.WriteLine(e.ToString());

				return null;
			}

		}

		private static PlaylistListResponse GetPlaylistsInfo()
		{
			var youtubeService = new YouTubeService(new BaseClientService.Initializer()
			{
				ApiKey = ConfigurationManager.AppSettings["Youtube-APIKEY"],
			});
			var listsReq = youtubeService.Playlists.List("id,contentDetails,snippet,status");
			listsReq.ChannelId = ConfigurationManager.AppSettings["Youtube-ChannelId"];
			return listsReq.Execute();

		}

		private static IList<PlaylistItem> GetVideosInAPlaylist(string listId, YouTubeService svc)
		{
			//var youtubeService = new YouTubeService(new BaseClientService.Initializer()
			//{
			//	ApiKey = ConfigurationManager.AppSettings["Youtube-APIKEY"],
			//});
			List<PlaylistItem> result = new List<PlaylistItem>();
			var req = svc.PlaylistItems.List("id,contentDetails,snippet,status");
			req.PlaylistId = listId;
			req.MaxResults = 20;
			var resp = req.Execute();
			result.AddRange(resp.Items);
			while (!string.IsNullOrEmpty(resp.NextPageToken))
			{
				req.PageToken = resp.NextPageToken;
				resp = req.Execute();
				result.AddRange(resp.Items);
			}
			return result;
		}

		public static YoutubeDataViewModel GetYoutubeDataViewModel()
		{
			var res = new YoutubeDataViewModel();
			var youtubeService = new YouTubeService(new BaseClientService.Initializer()
			{
				ApiKey = ConfigurationManager.AppSettings["Youtube-APIKEY"],
			});
			var listsReq = youtubeService.Playlists.List("id,contentDetails,snippet,status");
			listsReq.ChannelId = ConfigurationManager.AppSettings["Youtube-ChannelId"];
			listsReq.MaxResults = 20;
			var resp = listsReq.Execute();
			foreach (Playlist pl in resp.Items)
			{
				var id = pl.Id;
				var vids = GetVideosInAPlaylist(id, youtubeService);
				res.Data.Add(id, new YoutubePlaylist() { Id = id, Playlist = pl, Videos = vids });
			}
			while (!string.IsNullOrWhiteSpace(resp.NextPageToken))
			{
				listsReq.PageToken = resp.NextPageToken;
				resp = listsReq.Execute();
				foreach (Playlist pl in resp.Items)
				{
					var id = pl.Id;
					var vids = GetVideosInAPlaylist(id, youtubeService);
					res.Data.Add(id, new YoutubePlaylist() { Id = id, Playlist = pl, Videos = vids });
				}
			}
			return res;
		}

		/// <summary>
		/// Convert a string to base 64 string
		/// </summary>
		/// <param name="s"></param>
		/// <returns></returns>
		public static string ToBase64(string s)
		{
			return Convert.ToBase64String(Encoding.UTF8.GetBytes(s));
		}

		/// <summary>
		/// Convert a base 64 string to original string
		/// </summary>
		/// <param name="s"></param>
		/// <returns></returns>
		public static string FromBase64(string s)
		{
			int len = s.Length % 4;
			if (len != 0)
			{
				len = 4 - len;
				for (int i = 0; i < len; i++)
				{
					s += '=';
				}
			}
			byte[] bs = Convert.FromBase64String(s);
			return Encoding.UTF8.GetString(bs);
		}

		/// <summary>
		/// Download a web resource to byte array
		/// </summary>
		/// <param name="url"></param>
		/// <returns></returns>
		public static byte[] DownloadFile(string url)
		{
			byte[] b = null;
			WebClient wc = new WebClient();
			b = wc.DownloadData(url);
			return b;
		}
	}
}