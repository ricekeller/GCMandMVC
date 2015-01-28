using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatApp.MongoDB.BI.Model
{
    public enum MessageType
    {
        Text
    }
    public class Message
    {
        public AppUser Sender { get; set; }
        public AppUser Receiver { get; set; }
        public DateTime SendTimeStamp { get; set; }
        private byte[] RawMessage;
        private MessageType MessageType;
        private List<string> _errorMsgs;
        //public static Message Create(string senderID,string senderName,string senderRegID,
        //                             string receiverID,string receiverName,string receiverRegID,
        //                             byte[] msg,DateTime sendTime,MessageType msgType)
        //{

        //}
        public bool IsValid()
        {
            if (null == _errorMsgs)
            {
                _errorMsgs = new List<string>();
            }
            else
            {
                _errorMsgs.Clear();
            }
            if (null == RawMessage || RawMessage.Length == 0)//empty message
            {
                _errorMsgs.Add("Message can't be empty!");
                return false;
            }
            if (DateTime.Now.Subtract(SendTimeStamp) < TimeSpan.Zero)//future time
            {
                _errorMsgs.Add("Message send time is in the future!");
                return false;
            }
            if (string.IsNullOrEmpty(Enum.GetName(typeof(MessageType), MessageType)))//unsupported message type
            {
                _errorMsgs.Add("Message type is not supported!");
                return false;
            }
            if (!Sender.IsValid())
            {
                _errorMsgs.Add("Sender is invalid!");
                return false;
            }
            if (!Receiver.IsValid())
            {
                _errorMsgs.Add("Receiver is invalid!");
                return false;
            }
            return true;
        }
        public IEnumerable<string> GetErrorMsgs()
        {
            for(int i=0;i<_errorMsgs.Count;i++)
            {
                yield return _errorMsgs[i];
            }
        }
    }
}