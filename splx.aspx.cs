using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using VideoConnectionWeb.Helper;
using VideoConnectionWeb.Models;

namespace VideoConnectionWeb
{
    public partial class TestItem : System.Web.UI.Page
    {
        public string QueryMAC = "";
        public string ApiBaseUrl = "";
        private string JsonStr = "";
        private string RoomId = "";

        [Obsolete]
        protected void Page_Load(object sender, EventArgs e)
        {
            ApiBaseUrl = ConfigHelper.ApiBaseUrl;

            if (!IsPostBack)
            {
                QueryMAC = Request.QueryString["MAC"];
                if (!string.IsNullOrEmpty(QueryMAC))
                {
                    if (QueryMAC.Length == 12)
                    {
                        QueryMAC = JsonHelper.SetMACFormat(QueryMAC);
                    }
                    ApiUrlConfigHelper ApiUrl = new ApiUrlConfigHelper(ConfigHelper.ApiBaseUrl);
                    WebServiceHelper wsh = new WebServiceHelper();
                    Dictionary<string, string> dicContent = new Dictionary<string, string>();
                    dicContent.Add("MAC", QueryMAC);
                    DataResult dr = wsh.SendHttpPost(ApiUrl.HaveConference, dicContent);
                    if (dr.Code == 0)
                    {
                        if (dr.Data != null)
                        {
                            if (dr.Data.JsonStr != null)
                            {
                                string tempJsonStr = dr.Data.JsonStr;
                                string tempRoomId = dr.Data.RoomId;
                                string CHID = dr.Data.CHID;
                                string XM = dr.Data.XM;
                                string Title = dr.Data.Title;
                                string UserSig = dr.Data.UserSig;
                                Session["VideoJsonStr"] = tempJsonStr;
                                string url = "CheckApp.aspx?RoomId=" + tempRoomId + "&MAC=" + HttpUtility.UrlEncodeUnicode(QueryMAC) + "&CHID=" + CHID + "&XM=" + HttpUtility.UrlEncodeUnicode(XM) + "&Title=" + HttpUtility.UrlEncodeUnicode(Title) + "&UserSig=" + UserSig;
                                Response.Redirect(url);
                            }
                        }
                    }
                }
            }
        }
    }
}