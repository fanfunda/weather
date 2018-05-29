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
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyWeather: [ ]
  },
  
  /**
   * 生命周期函数--监听页面加载
   * 载入时产生的效果
   */
  onLoad: function () {
     this.getNow()
  },getNow: function(callback) {
    //获取数据，一般为json格式
    wx.request({
      //Url 是请求服务的服务求接口地址，在这里就使用我们天气的 API 地址
      url: 'https://test-miniprogram.com/api/weather/now',
      //Data 是请求的参数
      data: {
        city: '上海市'
      },
      //Success 确定了我们在获取数据成功时进行的操作，它的值应当是一个方法/函数
      success: res => {
        console.log(res)
        let result = res.data.result
        let temp = result.now.temp
        let weather = result.now.weather
        console.log(temp, weather)
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

        //获取天气信息
        let forecast = result.forecast
        //获取当前小时数
        let nowHour = new Date().getHours()
        //定义空数据
        let hourlyWeather = [ ]
        //循环输出每隔三小时的数据
        for (let i = 0; i < 24; i += 3) {
          hourlyWeather.push({
            time: (i + nowHour) % 24 + '时',
            iconPath: '/images/' + forecast[i / 3].weather + '-icon.png',
            temp: forecast[i / 3].temp + '°'
          })
        }
        hourlyWeather[0].time = '现在'
        //调用数据
        this.setData({
          hourlyWeather: hourlyWeather
        })

      },

      //complete回调函数，接口请求完成后，无论成功或失败都会执行
      complete: () => {
        //传入callback执行，若为空则不执行，为下拉刷新做准备
        callback && callback()
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