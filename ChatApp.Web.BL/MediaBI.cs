using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FlickrNet;

namespace ChatApp.Web.BL
{
    public class MediaBI
    {
        private const string APIKEY = "88258e146d70c7173f1e6886cfd57bcf";
        private const string SECRET = "db70c34d15aea037";
        private const string TOKEN = "72157649856687793-4f11a32c2085a9fd";
        private const string TOKENSECRET = "1eceabe4d07cc651";
        private const string USERID = "130989293@N07";
        private const int PHOTOSPERPAGE = 30;
        private static Flickr flickr;
        static MediaBI()
        {
            flickr = new Flickr(APIKEY, SECRET);
            flickr.OAuthAccessToken = TOKEN;
            flickr.OAuthAccessTokenSecret = TOKENSECRET;
        }
   
        public static Photoset GetPhotoSet(string setID)
        {
            return flickr.PhotosetsGetInfo(setID);
        }

        public static PhotosetCollection GetPhotoSets()
        {
            return flickr.PhotosetsGetList(USERID);
        }

        public static PhotosetPhotoCollection GetPhotosInSet(string setID)
        {
            return flickr.PhotosetsGetPhotos(setID);
        }
        public static PhotosetPhotoCollection GetPhotosInSet(string setID,int page)
        {
            return flickr.PhotosetsGetPhotos(setID, page, PHOTOSPERPAGE);
        }
        public static Context GetPrevNextPhotosInSet(string setID,string photoID)
        {
            return flickr.PhotosetsGetContext(photoID, setID);
        }

        public static ExifTagCollection GetExif(string photoID)
        {
            return flickr.PhotosGetExif(photoID);
        }

        public static PhotoInfo GetPhotoInfo(string photoID)
        {
            return flickr.PhotosGetInfo(photoID);
        }
        public static List<PhotoInfo> GetPhotosInfoInASet(string setID)
        {
            //List<PhotoInfo> res = new List<PhotoInfo>();
            //foreach(Photo p in GetPhotosInSet(setID))
            //{

            //}
            return null;
        }
        public static PlaceInfo GetPhotoGeoInfo(string photoID)
        {
            return flickr.PhotosGeoGetLocation(photoID);
        }
    }
}
