using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using VideoConnectionWeb.Helper;
using WSLLZ.Class;

namespace VideoConnectionWeb.QZ
{
    public partial class CheckApp : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            int c = Check();
            if (c != 0)
            {
                Response.Write(c);
            }
        }

        private int Check()
        {
            string m = Request.QueryString["m"];
            string l = Request.QueryString["l"];
            bool isLive = !String.IsNullOrEmpty(Request.QueryString["live"]);
            bool isMobile = !String.IsNullOrEmpty(Request.QueryString["mobile"]);
            ToSPLXCheckInfo info = null;
            string str = "";
            try
            {
                if (string.IsNullOrEmpty(m))
                {
                    return -1;
                }
                info = JsonHelper.DeserializeJSON<ToSPLXCheckInfo>(Sm4Helper.Decrypt(m));
                long ts = ToolHelper.GetTimeStamp();
                DateTime dt1 = ToolHelper.GetDateTime(ts);
                DateTime dt2 = ToolHelper.GetDateTime(info.TS);
                if ((ts - info.TS) > 180)//180秒过期
                {
                    return -2;
                }
                str = Sm4Helper.Encrypt(JsonHelper.SerializeJSON(info.Info));
            }
            catch (Exception ex)
            {
                LogHelper.SaveErrLog("CheckApp.aspx", ex);
                return -3;
            }

            Session["VideoJsonStr"] = str;
            if (isLive)
            {
                if (isMobile)
                {
                    Response.Redirect("mzb.aspx?RoomId=" + info.RID);
                }
                else
                {
                    Response.Redirect("zb.aspx?RoomId=" + info.RID);
                }
            }
            else
            {
                if (l == "z")//进入展示端
                {
                    Response.Redirect("big.aspx?RoomId=" + info.RID);
                }
                else if (l == "s" || isMobile)//进入手机端
                {
                    if (info.CJRLX == 1)//创建人类型1工作人员 2代表
                    {
                        Response.Redirect("mobile.aspx?RoomId=" + info.RID);
                    }
                    else
                    {
                        Response.Redirect("mobile.aspx?RoomId=" + info.RID);
                    }
                }
                else
                {//进入PC或大屏端
                    if (info.CJRLX == 1)//创建人类型1工作人员 2代表
                    {
                        Response.Redirect("index.aspx?RoomId=" + info.RID);
                    }
                    else
                    {
                        Response.Redirect("index.aspx?RoomId=" + info.RID);
                    }
                }
            }

            return 0;
        }
    }
}