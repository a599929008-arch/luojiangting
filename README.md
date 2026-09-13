# 生日网站部署与改字说明

> 网站文件不需要任何修改，按下面三步走即可。全程免费、永久有效。

---

## 第一步：把网站上传到 GitHub

1. 打开 https://github.com 注册（或登录）一个账号
2. 登录后打开 https://github.com/new （新建仓库）
   - Repository name 填：`birthday-site`（也可以随便起，只用小写英文和横线）
   - 选择 **Public**（必须公开，免费版才能用 GitHub Pages）
   - 其他都不用动，点最下面绿色的 **Create repository**
3. 在新建出来的页面中间，找到 **"uploading an existing folder"** 这个链接点进去
   - 把本文件所在的 `birthday` 文件夹里的**全部内容**（不是文件夹本身）拖进上传框
   - 等 `index.html、style.css、script.js、content.json、各个信件页面、admin 文件夹` 都列出来后
   - 点最下面的 **Commit changes**，等待上传完成

> 注意：拖拽上传要拖 `birthday` 文件夹**里面**的文件，上传后仓库根目录应直接能看到 `index.html`。

---

## 第二步：开启 GitHub Pages（免费挂到网上）

1. 在仓库页面点 **Settings**（顶部标签）
2. 左侧栏点 **Pages**
3. 在 **Branch** 区域：Select branch 选 **main**，文件夹保持 **/(root)**，点 **Save**
4. 刷新页面，等 1～2 分钟，顶部会出现绿色提示框，里面就是你的网址：

```
https://你的GitHub用户名.github.io/birthday-site/
```

这个网址永久有效，之后每次改内容会自动更新，不用重新部署。

---

## 第三步：以后怎么改文字

### 方式 A（推荐）：本地中文后台 edit.html

文件夹里的 `edit.html` 就是一个带密码的中文后台，**双击就能用，不用联网**：

1. 双击打开 `edit.html` → 输入后台密码（默认 **0813**，和网站密码相同）
2. 像填表格一样改字：每封信、彩蛋、封面都分好了区块
3. 想加**语音条**：在「🥚 彩蛋页」最下面的「🎵 彩蛋语音条」里点"添加一条"，填标题和文件名
4. 点右上角「**导出并下载**」，得到新的 `content.json`
5. 打开 GitHub 仓库 → **Add file → Upload files** → 把新的 content.json 拖进去 → Commit changes，约 1 分钟后网站自动更新

**上传语音文件的步骤：**

1. 把录音文件准备好，建议命名 `voice1.mp3`、`voice2.mp3`（支持 mp3 / m4a / wav，文件名用英文）
2. GitHub 仓库页面 → **Add file → Upload files** → 把音频文件拖进去 → Commit changes
3. 回到后台，在「彩蛋语音条」里填：标题 + 文件名（如 `voice1.mp3`；如果传到了 audio 文件夹里就写 `audio/voice1.mp3`）
4. 导出 content.json 并上传到 GitHub，手机打开彩蛋页就能听到语音了

> 注意：`edit.html` 只是你自己电脑上的编辑器，**不需要上传到 GitHub**（留着本地用就行）。后台密码想改的话，用记事本打开 edit.html，找到 `ADMIN_PASSWORD = "0813"` 这一行改成你想要的。

**🎵 加背景音乐（BGM）的步骤：**

1. 把音乐文件（建议 mp3、5MB 以内）命名为 `BGM.mp3`，按上传语音一样的方式传到 GitHub 仓库根目录
2. 打开 edit.html → 「网站设置」里的「背景音乐文件名」填 `BGM.mp3` → 导出 content.json → 上传 GitHub
3. 手机打开网站后音乐会自动响起，**右上角有个 ♪ 小按钮可以随时关掉**；翻页音乐不会中断（会记住进度）
4. 小提示：手机浏览器规定"用户没碰过屏幕前不许放声音"，所以严格来说是**输入完密码的那一刻**音乐响起——体验上和自动播放一样

### 方式 B（备用）：GitHub 网页直接改

所有文字（密码、称呼、每封信的段落、彩蛋内容）都集中在 **content.json** 这一个文件里。

1. 打开你的仓库页面，点击文件列表里的 `content.json`
2. 点右上角的**铅笔图标**（Edit this file）进入编辑
3. 直接改引号里面的文字，改完拉到最下方点 **Commit changes**
4. 大约 1 分钟后网站自动更新（手机浏览器打开 GitHub 网页也可以这样改）

### 每个字段对应哪里

| 字段 | 是什么 |
|---|---|
| `site.password` | 进入网站的密码（目前是 0813） |
| `site.toName` / `site.fromName` | 封面 TO 后面的称呼 / 落款 |
| `site.date` | 封面日期 |
| `index.tagline` | 封面那句话 |
| `past` / `present` / `future` | 01～03 三封信的内容 |
| `words` | 04 我想对你说 |
| `birthday` | 05 生日快乐页 |
| `secret` | 隐藏彩蛋页（豆子、深夜时间等） |

### 改字唯一要注意的

JSON 格式的规则：**每行结尾的引号、逗号、大括号都不要动，只改引号里面的中文**。
如果不小心改坏了保存后显示红色报错，把那段改回原样再重试即可；实在乱了可以叫 AI 帮你看一眼。

---

## 两个提醒（不影响使用，但建议知道）

1. **密码只是"君子防"**：`content.json` 是公开的，懂技术的人打开网页源码就能看到密码 0813。作为给一个人的小站够用了，但不要当作真正的加密。
2. **不要删 admin 文件夹**：留着不碍事，以后万一想换成更方便的表单式后台，可以直接用。
