# 前言

本项目未直播会议前台demo展示，虽然是会议的demo但仍包含了以下的一些常用的项目的初始化模板，运行项目的首页就是会议的demo，你也可以修改utils文件中文件（会议相关文件）来自定义
callupMany 多对多会议
callupOne 一对一音视频通话(里边包含了ws的后台连接)
mergeStream 合并音视频流

下载依赖(下载依赖之后会开启prettier和ESLint以及[git提交规范](https://github.com/conventional-changelog/commitlint/#what-is-commitlint))

```shell
yarn
```

使用脚手架默认初始化了一个空的git仓库，如果想要关联github仓库执行以下命令

```shell
git branch -M main
```

```shell
git remote add origin 仓库地址
```

## 项目说明

该项目是脚手架xytem的react模板仓库，包含了我写react项目的一些经验，目的是为了避免开发时使用脚手架生成项目之后仍需要下载多种东西，比如axios、antd等，同时还需要添加平常写项目的一些自己写的工具，具体效果可以运行项目进入/demo看实际效果

> 采用技术栈
> react + ts + react-toolkit + axios + react-router + antd + sass + pritter + commitlint

> 本项目与脚手架创建的项目区别如下
>
> 1. 常用hook封装
>    1.1 **useAsync()** 访问接口封装，对接口返回数据以及请求接口状态统一管理
>    1.2 **useModal()** 弹窗hook，可全局调用，通过传入配置生成对应form表单或提示框，可promise回调
>    1.3 **无限滚动** 无限滚动hook，监听滚动事件，与useAsync()相结合并使用虚拟列表优化
>    1.4 **useCountDown()** 倒计时hook，用于处理倒计时获取验证码等
>    1.5 **useDebounce()** 用于处理防抖函数
>    1.6 **useThrottle()** 用于处理节流函数
> 2. **axios+ts**二次封装，封装响应拦截器和请求拦截器
> 3. 与权限管理相关的高阶组件封装，可传入回调函数自定义是否跳转页面
> 4. Form表单及常用Form表单组件进行二层封装以及后台页面的二次封装（可通过配置一键生成后台页面，也可以使用另一个项目来进行在线编写代码或拖拽生成对应项目）
> 5. 登录信息持久化
> 6. 项目的基本配置

> 除上述每个项目都拥有的功能之外，还可以通过脚手架生成对应功能的工具以及测试页面（包括node写的后台接口）
>
> 1. canvas实现的弹幕
> 2. 采用webrtc实现点对点音视频通话以及多对多直播会议
> 3. 瀑布流以及无限滚动列表(包含图片虚拟代理优化)

## 模板项目的其他设置

1. 代理设置
   使用脚手架生成对应的项目代理配置文件
2. 登录、注册以及忘记密码页面配置
   登录页面登录访问对应接口(finishHandle函数中)，注册页面获取验证码(getCode函数中)和注册访问对应接口(finishHandle函数中)，忘记密码获取验证码(getCode函数中)和修改密码对应接口(finishHandle函数中)
3. demo页面演示，如果不想使用直接把demo文件夹删除即可，并再router的index.tsx文件中移除相对应的引入
4. useAsync()由于对请求接口的进一层封装，所以需要改动setDate函数中给数据赋值的逻辑
