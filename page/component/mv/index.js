var common = require('../../../utils/util.js');
var bsurl = require('../../../utils/bsurl.js');
var app = getApp();
Page({
  data: {
    main: {},
    tab: 0,
    mvUrl: "",
    rec: {},
    loading: true,
    offset: 0,
    limit: 20,
    recid: 0,
    loading2:true,
    simi: {},
    id: ""
  },
  onLoad: function (options) {
    var that = this;
    this.setData({
      id:options.id
    })
    wx.request({
      url: bsurl + 'mv/detail',
      data: {
        mvid: options.id
      },
      success: function (res) {
        console.log(res,89898);
        wx.getNetworkType({
          complete: function (r) {
            var wifi = r.networkType != 'wifi' ? false : true;
            that.setData({
              id: options.id,
              main: res.data.data,
              wifi: wifi,
              loading:false,
              recid: res.data.data.commentThreadId
            });
          }
        })

        wx.setNavigationBarTitle({
          title: res.data.data.name
        })
      }
    })
    wx.request({
      url: bsurl + 'mv/url',
      data:{
        id:options.id
      },
      success:res=>{
        console.log(res.data.data,'mv地址');
        that.setData({
          mvUrl:res.data.data.url
        })
        console.log();
      }
    })
  },
  tab: function (e) {
    var t = e.currentTarget.dataset.tab;
    this.setData({
      tab: t
    });
    var that = this;
    if (this.data.tab == 1 && this.data.rec.code != 200) {
      common.loadrec(app.globalData.cookie, this.data.offset, this.data.limit, this.data.recid, function (data) {
        that.setData({
          loading: false,
          rec: data,
          offset: data.comments.length
        });
      }, 1)
    }
    console.log(that.data.id,9999);
    if (this.data.tab == 2 && this.data.simi.code != 200) {
      that.setData({ loading: true });
      wx.request({
        url: bsurl + 'simi/mv',
        data: { mvid: that.data.id },
        success: function (res) {
          that.setData({
            loading: false,
            simi: res.data
          });
        }
      })
    }
  },
  loadmore: function () {
    if (this.data.rec.more && !this.data.loading) {
      var that = this;
      this.setData({
        loading2: true
      })
      common.loadrec(app.globalData.cookie, this.data.offset, this.data.limit, this.data.recid, function (data) {
        var rec = that.data.rec;
        var offset = that.data.offset + data.comments.length
        data.comments = rec.comments.concat(data.comments);
        data.hotComments = rec.hotComments;
        that.setData({
          loading2: false,
          rec: data,
          offset: offset
        });
      }, 1)
    }
  }
})