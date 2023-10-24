const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer:{
    proxy:{
      "/gen":{
        target: 'http://api.captcha.tianai.cloud',
        changeOrigin: true
      },
      "/check":{
        target: 'http://api.captcha.tianai.cloud',
        changeOrigin: true
      }
    }
  }
})
