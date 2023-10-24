<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <form action="/">
    用户名：<input type="text" v-model="formLogin.username">
    <br/>
    密码：<input type="password" v-model="formLogin.password">
  </form>
  <a href="javascript:" @click="checkAuth">登录</a>
  <div class="authBoxModal" v-if="showAuthBox">
    <div class="authBox">
      <div id="captcha-div"></div>
    </div>
  </div>
</template>

<script>
import { ref } from  "vue"
import "@/assets/captcha/css/tianai-captcha.css"
import '@/assets/captcha/js/jquery.min'
import {initRandomCaptcha} from '@/assets/captcha/js/tianai-captcha'

export default {
  name: 'App',
  components: {},
  setup(){
    const formLogin = ref({"username": "user1", "password": "u!@@#4545", "authId": ""})
    const showAuthBox = ref(false)
    const captcha = ref(null)
    function checkAuth(){
      showAuthBox.value = true;
      captcha.value = initRandomCaptcha("#captcha-div", {
        genCaptchaUrl: "/gen?type=SLIDER",
        validUrl: "/check",
        validSuccessCallback: (res, c) => {
          formLogin.value.authId = localStorage.getItem("currentCaptchaId");
          showAuthBox.value = false;
          c.destroyWindow();
          localStorage.removeItem("currentCaptchaId");
          execLogin();
        }
      }, {
        btnUrl: require("/src/assets/captcha/images/move-btn.png"),
        bgUrl: require("/src/assets/captcha/images/bg-black.jpg"),
        moveTrackMaskBgColor: "#f7b645",
        moveTrackMaskBorderColor: "#ef9c0d",
        logoUrl : require("/src/assets/captcha/images/logo.png")
      })
      captcha.value.loadCaptcha();
    }
    function execLogin(){
      console.log(formLogin);
    }
    return {
      formLogin,
      showAuthBox,
      checkAuth
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.authBoxModal{ display: flex;align-items: center;flex-direction: column;justify-content: center; top: 0;left: 0; position: fixed;z-index: 3;width: 100%;height: 100%;background: rgba(0,0,0,0.5);}
.authBox{position: relative;width: 100%;display: flex;align-items: center;justify-content: center;}
</style>
