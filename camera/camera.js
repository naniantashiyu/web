var g_iWndIndex = 0
var szInfo = ""
var data={
    szIP :"192.168.192.254",
    szPort:81,
    szUsername:"admin",
    szPassword:"intelpac123",
    szInfo:""
}

function initWebKIK() {
    //检查浏览器是否支持无插件
    if (!WebVideoCtrl.I_SupportNoPlugin()) {
      Notification.warning({
        title: '提示',
        message: "当前浏览器不支持无插件预览监控视频，已自动切换成插件模式，如果还未安装插件请安装",
      });
      // 检查插件是否已经安装过
      const iRet = window.WebVideoCtrl.I_CheckPluginInstall();
      if (-1 == iRet) {
        Notification.warning({
          title: '提示',
          message: "您还未安装过插件，请先下载WebComponentsKit.exe双击安装！",
        });
        return;
      }
    }
    // 初始化插件参数及插入插件
    WebVideoCtrl.I_InitPlugin("100%", "100%", {
      bWndFull: true,     //是否支持单窗口双击全屏，默认支持 true:支持 false:不支持
      iPackageType: 2,
      //szColorProperty:"plugin-background:0000ff; sub-background:00B2BF; sub-border:e7eaec; sub-border-select:0000ff",   //2:PS 11:MP4
      iWndowType: 3,
      bNoPlugin: true,//是否启用无插件
      cbSelWnd: function (xmlDoc) {
        g_iWndIndex = parseInt($(xmlDoc).find("SelectWnd").eq(0).text(), 10);
        szInfo = "当前选择的窗口编号：" + g_iWndIndex;
        console.log(szInfo);
      },
      cbDoubleClickWnd: function (iWndIndex, bFullScreen) {
        szInfo = "当前放大的窗口编号：" + iWndIndex;
        if (!bFullScreen) {
          szInfo = "当前还原的窗口编号：" + iWndIndex;
        }
        console.log(szInfo);
      },
      cbEvent: function (iEventType, iParam1, iParam2) {
        if (2 == iEventType) {// 回放正常结束
          showCBInfo("窗口" + iParam1 + "回放结束！");
        } else if (-1 == iEventType) {
          showCBInfo("设备" + iParam1 + "网络错误！");
        } else if (3001 == iEventType) {
          clickStopRecord(g_szRecordType, iParam1);
        }
      },
      cbRemoteConfig: function () {
        console.log("关闭远程配置库！");
      },
      cbInitPluginComplete: function () {
        WebVideoCtrl.I_InsertOBJECTPlugin("divPlugin");
        //WebVideoCtrl.I_InsertOBJECTPlugin("divPluginTwo");
   
        // 检查插件是否最新
        if (-1 == WebVideoCtrl.I_CheckPluginVersion()) {
          Notification.warning({
            title: '提示',
            message: "检测到新的插件版本，双击WebComponentsKit.exe升级！",
          });
          return;
        }
      }
    });
}
  

//登录
function clickLogin() {
    /*
    * szIP 设备的 IP 地址
    iPrototocol  http 协议，1 表示 http 协议 2 表示 https 协议
    iPort  登录设备的 http/https 端口号，根据 iPrototocol 选择传入不同的端口
    szUserName  登录用户名称
    szPassword  用户密码
    options 可选参数对象:
    async  http 交互方式，true 表示异步，false 表示同步
    cgi  CGI 协议选择，1 表示 ISAPI，2 表示 PSIA，如果不传这个参数，会
    自动选择一种设备支持的协议.
    success  成功回调函数，有一个参数，表示返回的 XML 内容。
    error  失败回调函数，有两个参数，第一个是 http 状态码，第二个是设
    备返回的 XML(可能为空)
    * */
    var iRet = WebVideoCtrl.I_Login(
      data.szIP,
      1,
      data.szPort,
      data.szUsername,
      data.szPassword,
      {
        success: function (xmlDoc) {
          alert('登录成功')
        }, error: function () {
          alert('登录失败！');
        }
    });
}

// 退出
function clicklogout() {
    var szDeviceIdentify =data.szIP;
    var result=WebVideoCtrl.I_Logout(szDeviceIdentify);
    if(result==0)
    {
        alert(szDeviceIdentify+"退出登录成功！");
    }else{
        alert(szDeviceIdentify+"退出登录失败！");
    }
   
}
//获取数字、模拟、零通道
function getChannelInfo() {
    var szDeviceIdentify = $("#ip").val(),
        oSel = $("#channels").empty;
    if (null == szDeviceIdentify) {
        return;
    }
    //模拟
    WebVideoCtrl.I_GetAnalogChannelInfo(szDeviceIdentify, {
        async: false,
        success: function (xmlDoc) {
            var oChannels = $(xmlDoc).find("VideoInputChannel");
            $.each(oChannels, function (i) {
                var id = $(this).find("id").eq(0).text(0),
                    name = $(this).find("name").eq(0).text(0);
                if ("" == name) {
                    name = "Camera" + (i < 9 ? "0" + (i + 1) : (i + 1));
                }
                oSel.append("<option value='" + id + "' bZero='false'>" + name + "</option");
            });
            showOPInfo(szDeviceIdentify + "获取模拟通道成功！");
        },
        error: function (status, xmlDoc) {
            showOPInfo(szDeviceIdentify + " 获取模拟通道失败！", status, xmlDoc);
        }
    })
    //数字
    WebVideoCtrl.I_GetDigitalChannelInfo(szDeviceIdentify, {
        async: false,
        success: function (xmlDoc) {
            var oChannels = $(xmlDoc).find("InputProxyChannelStatus");
            $.each(oChannels, function (i) {
                var id = $(this).find("id").eq(0).text(0),
                    name = $(this).find("name").eq(0).text(0),
                    online = $(this).find("online").eq(0).text(0);
                if ("false" == online) {
                    return true;
                }
                if ("" == name) {
                    name = "IPCamera" + (i < 9 ? "0" + (i + 1) : (i + 1));
                }
                oSel.append("<option value='" + id + "' bZero='false'>" + name + "</option");
            });
            showOPInfo(szDeviceIdentify + "获取数字通道成功！");
        },
        error: function (status, xmlDoc) {
            showOPInfo(szDeviceIdentify + " 获取数字通道失败！", status, xmlDoc);
        }
    });
    //零通道
    WebVideoCtrl.I_GetZeroChannelInfo(szDeviceIdentify, {
        async: false,
        success: function (xmlDoc) {
            var oChannels = $(xmlDoc).find("ZeroVideoChannel");
            $.each(oChannels, function (i) {
                var id = $(this).find("id").eq(0).text(0),
                    name = $(this).find("name").eq(0).text(0);
                if ("" == name) {
                    name = "Zero Channel" + (i < 9 ? "0" + (i + 1) : (i + 1));
                }
                if ("true" == $(this).find("enabled").eq(0).text()) {
                    oSel.append("<option value='" + id + "' bZero='false'>" + name + "</option");
                }
            });
            showOPInfo(szDeviceIdentify + "获屈零通道成功！");
        },
        error: function (status, xmlDoc) {
            showOPInfo(szDeviceIdentify + " 获取数字通道失败！", status, xmlDoc);
        }
    })
}
//预览

function clickStartRealPlay() {
    console.log("窗口" + g_iWndIndex + "开始预览");
    var iRet = WebVideoCtrl.I_StartRealPlay("192.168.192.254", {
        //码流类型 1-主码流，2-子码流，默认使用主码流预览
        //iStreamType: 1,//iStreamType
        //播放窗口，如果不传，则默认使用当前选择窗口播放（默认选中窗口 0）
        //iWndIndex: g_iWndIndex,
        //播放通道号，默认通道 1
        //iChannelID: 1,//iChannelID
        bZeroChannel: false,
        success: function () {
            console.log("预览成功");
        }, error: function (status, xmlDoc) {
            console.log("预览error");
            if (403 === status) {
                szInfo = "设备不支持Websocket取流！";
            } else {
                szInfo = "开始预览失败！";
            }
            console.log("192.168.192.254" + " " + szInfo + xmlDoc);
        }
    });
}
//结束预览
function clickStopRealPlay() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        WebVideoCtrl.I_Stop({
            success: function () {
                szInfo = "停止预览成功！";
                alert(oWndInfo.szDeviceIdentify + " " + szInfo);
            },
            error: function () {
                szInfo = "停止预览失败！";
                alert(oWndInfo.szDeviceIdentify + " " + szInfo);
            }
        });
    }
}



