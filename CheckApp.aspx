<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="CheckApp.aspx.cs" Inherits="VideoConnectionWeb.QZ.CheckApp" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <script src="../js/jquery-3.6.0.min.js"></script>
    <script src="../js/layui/layui.js"></script>
    <script src="../js/layui/layCommon.js"></script>
    <link href="../js/layui/css/layui.css" rel="stylesheet" />
    <script>
        $(function () {
            var MAC = getvl("MAC");
            var RoomId = getvl("RoomId");
            var CHID = getvl("CHID");
            var XM = unescape(getvl("XM"));
            var Title = unescape(getvl("Title"));
            var UserSig = getvl("UserSig");
            // 安卓端
            if (window.android && window.android.enterMeetingRoom) {
                window.android.enterMeetingRoom(CHID, XM, RoomId, Title, UserSig);
                location.replace("dp.aspx?MAC=" + MAC);
            } else {
                location.replace("index.aspx?RoomId=" + RoomId);
            }
        })
    </script>
</head>
<body>
</body>
</html>
