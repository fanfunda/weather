//建立映射，将cloudy转换为多云
const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

//建立映射，根据天气变换导航栏颜色
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

//建立常量映射，引入qqmap-wx-jssdk.js文件
const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')


const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyWeather: [ ],
    todayDate: '',
    todayTemp: '',
    city: '北京市',
    locationAuthType: UNPROMPTED
  },
  
  /**
   * 生命周期函数--监听页面加载
   * 载入时产生的效果
   */
  onLoad: function () {
    this.qqmapsdk = new QQMapWX({
      key: 'DP2BZ-DVGWF-MAYJZ-N5MIJ-A2VZZ-2RFAE'
      })

    //调用系统设置界面
    wx.getSetting({
      success: res => {
        //查询一下用户是否授权定位权限
        let auth = res.authSetting['scope.userLocation']
        //渲染数据
        this.setData({
          //true授权就赋值为AUTHORIZED，更新为当前位置
          locationAuthType: auth ? AUTHORIZED
          //如果为false,就赋值为UNAUTHORIZED，让用户点击开启权限；如果也不是false，就赋值为UNPROMPTED，让用户获取权限
            : (auth === false) ? UNAUTHORIZED : UNPROMPTED
        })

        if (auth)
          this.getCityAndWeather()
        else
          this.getNow() //未授权使用默认城市北京
      },
      fail: () => {
        this.getNow() //使用默认城市北京
      }
    })
  },getNow: function(callback) {
    //获取数据，一般为json格式
    wx.request({
      //Url 是请求服务的服务求接口地址，在这里就使用我们天气的 API 地址
      url: 'https://test-miniprogram.com/api/weather/now',
      //Data 是请求的参数
      data: {
        city: this.data.city
      },
      //Success 确定了我们在获取数据成功时进行的操作，它的值应当是一个方法/函数
      success: res => {
        //console.log(res)
        let result = res.data.result
        //调用已定义好的函数
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)
      },

      //complete回调函数，接口请求完成后，无论成功或失败都会执行
      complete: () => {
        //传入callback执行，若为空则不执行，为下拉刷新做准备
        callback && callback()
      }

    })
  },

  //现在天气状况函数
  setNow(result){
    let temp = result.now.temp
    let weather = result.now.weather
    //console.log(temp, weather)
    //绑定数据
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    })

    // 变换导航条背景色
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })

  },

  //未来天气状况函数
  setHourlyWeather(result){

    //获取天气信息
    let forecast = result.forecast
    //获取当前小时数
    let nowHour = new Date().getHours()
    //定义空数据
    let hourlyWeather = []
    //循环输出每隔三小时的数据
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    //调用数据
    this.setData({
      hourlyWeather: hourlyWeather
    })

  },

  //今天的最高最低气温和日期函数
  setToday(result) {
    let date = new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}° - ${result.today.maxTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },

  onTapDayWeather() {
    //消息提示框
    wx.showToast()
    //页面跳转
    wx.navigateTo({
      //url?后可传递参数
      url: '/pages/list/list?city=' + this.data.city
    })
  },


  //是否允许获取位置信息函数
  onTapLocation() {
    if (this.data.locationAuthType === UNAUTHORIZED)
      //调用客户端小程序设置界面
      wx.openSetting({
        success: res => {
          //console.log(res)
          //查询一下用户是否授权定位权限
          if (res.authSetting['scope.userLocation']) {
            this.getCityAndWeather()
          }
        }
      })
    else
      this.getCityAndWeather()
  },

  //获取位置信息成功或失败执行的函数
  getCityAndWeather() {
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED,
        })
        //console.log(res.latitude, res.longitude)
        this.qqmapsdk.reverseGeocoder({
          //获取经纬度
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          //获取成功后转化为城市
          success: res => {
            let city = res.result.address_component.city
            this.setData({
              city: city,
            })
            //保持使用定位城市信息
            this.getNow()
          }
        })
      },
      //fail失败后执行
      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED,
        })
      }

    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    //传入匿名函数
    this.getNow(() => {
      //下拉数据刷新后立即停止
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})