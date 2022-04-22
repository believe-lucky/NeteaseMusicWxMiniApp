var bsurl = require("../../../utils/bsurl.js");
var app = getApp();
import drawQrcode from "weapp-qrcode";
// 或者，将 dist 目录下，weapp.qrcode.min.js 复制到项目目录中
// import drawQrcode from '../../../utils/weapp.qrcode.min.js'
Page({
  data: {
    phone: "",
    pwd: "",
    linktype: 1,
    url: "",
    qrImg: "",
  },
  onLoad: function (options) {
    this.qrLogin();
    this.draw();
    //登录成功后跳转类型(1,2,3) navgitorback , redirect ,switchTab
    this.setData({
      linktype: options.t || 3,
      url: options.url || "../home/index",
    });
  },
  textinput: function (event) {
    var type = event.currentTarget.dataset.type;
    if (type == 1) {
      this.setData({
        phone: event.detail.value,
      });
    } else {
      this.setData({
        pwd: event.detail.value,
      });
    }
  },
  qrLogin: function () {
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    wx.request({
      url: bsurl + "login/qr/key?timestamp=" + timestamp,
      success: (res) => {
        console.log(res, "qrlogin");
        var unikey = res.data.data.unikey;
        console.log(res);
        if (unikey) {
          this.qrCreate(unikey);
          let check = setInterval(async () => {
            let res = this.qrCheck(unikey);
            console.log(res.data.message, "---");
            if (res.data.code == 800) {
              alert(res.data.message);
              clearInterval(check);
            }
            if (res.data.code == 803) {
              alert(res.data.message);
              clearInterval(check);
            }
          }, 30000);
        }
      },
    });
  },
  qrCreate: function (unikey) {
    wx.request({
      url: bsurl + "login/qr/create?qrimg=true",
      data: {
        key: unikey,
      },
      success: (res) => {
        console.log(res, "二维码生成");
        var qrurl = res.data.data.qrurl;
        this.setData({
          qrImg: res.data.data.qrimg,
        });
        this.draw(qrurl);
      },
    });
  },
  draw(qrurl) {
    drawQrcode({
      width: 200,
      height: 200,
      canvasId: "myQrcode",
      text: qrurl,
      callback(e) {
        console.log("e: ", e);
        console.log("扫码成功");
      },
    });
  },
  qrCheck: function (unikey) {
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    wx.request({
      url: bsurl + `login/qr/check?timestamp=${timestamp}`,
      data: {
        key: unikey,
      },
      success: (res) => {
        console.log(res, "二维码check");
        wx.showToast({
          title: res.data.message,
          icon: "error",
          duration: 2000,
        });
      },
    });
  },
  login: function () {
    var that = this;
    var url = /^0\d{2,3}\d{7,8}$|^1[34578]\d{9}$/.test(that.data.phone)
      ? "login/cellphone"
      : "login";
    wx.showToast({
      title: "登录中...",
      icon: "loading",
    });
    wx.request({
      url: bsurl + url,
      method: "GET",
      data: {
        email: that.data.phone,
        phone: that.data.phone,
        password: that.data.pwd,
      },
      complete: function (res) {
        console.log(res);
        wx.hideToast();
        console.log(res, 889999);
        if (res.data.code != 200) {
          wx.showModal({
            title: "提示",
            content: "登录失败，请重试！",
          });
          return;
        }
        wx.setStorage("user", res.data);
        app.mine();
        app.likelist();
        if (that.data.linktype == 1) {
          wx.navigateBack({
            delta: 1,
          });
        } else if (that.data.linktype == 2) {
          wx.redirectTo({
            url: that.data.url,
          });
        } else {
          wx.switchTab({
            url: "../home/index",
          });
        }
      },
    });
  },
});
