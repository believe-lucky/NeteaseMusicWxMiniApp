var app = getApp();
var bsurl = require("../../../utils/bsurl.js");
Page({
  data: {
    list: [],
    subcount: {},
    loading: true,
  },
  onLoad: function () {
    var that = this;
    var id = wx.setStorage("user") || {};
    if (JSON.stringify(JSON.parse(id)) === "{}")
    console.log(id, 99999999);
    id = id.account.id;
    this.setData({ uid: id });
    wx.request({
      url: bsurl + "user/subcount?id=" + id,
      success: function (res) {
        that.setData({
          subcount: res.data,
        });
      },
    });
    wx.request({
      url: bsurl + "user/playlist",
      data: {
        uid: id,
        offset: 0,
        limit: 1000,
      },
      success: function (res) {
        that.setData({
          loading: false,
          list1: res.data.playlist.filter(function (item) {
            return item.userId == id;
          }),
          list2: res.data.playlist.filter(function (item) {
            return item.userId != id;
          }),
        });
      },
    });
  },
  onShow: function () {
    console.log("me show----------");
  },
  goSignIn: function () {
    wx.navigateTo({
      url: "../login/index",
    });
  },
});
