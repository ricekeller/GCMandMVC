using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace ChatApp.Web.Models
{
	public static class Utils
	{
		public static TimeSpan Diff(DateTime date1,DateTime date2)
		{
			return date2.Subtract(date1);
		}

		public static bool IsBackoffTimePassed(DateTime date,int backoffSeconds)
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
	}
}