# 🫁 智肝 - 肝脏健康管理小程序

## 项目简介

"智肝"是一款软硬件协同的**肝脏疾病居家智能检测与慢病全病程管理**微信小程序。配合"智肝居家检测盒"硬件使用，通过 Kimi 视觉 AI 实现试纸图像的自动化判读，为用户提供从普惠自检到数字化慢病管理的完整闭环。

### MVP 核心功能

| 功能 | 说明 |
|------|------|
| 🔐 账号登录 | 用户名 + 密码登录 / 注册（姓名+用户名+密码），账号存云数据库，跨设备可登录 |
| 👨‍👩‍👧‍👦 家庭管理 | 支持多成员健康档案，检测数据按成员独立管理 |
| 🔍 智能检测 | 扫码→拍照采样→Kimi AI 图像分析→生成报告 |
| 💬 在线问诊 | 患者咨询医生、分享报告/图片，医生端患者列表管理 |
| 📋 检测报告 | 专属电子报告，展示 GCA/AFP 定量数值与风险评级 |
| 📊 趋势追踪 | GCA/AFP 双指标历史趋势折线图（Canvas 2D 绘制） |
| 📁 报告归档 | 按时间线展示所有历史检测记录，支持筛选和删除 |

---

## 技术栈

- **框架**：微信小程序原生（WXML + WXSS + JavaScript）
- **AI 引擎**：[Kimi](https://moonshot.cn) Vision API（`kimi-k3` 模型）
- **图表**：Canvas 2D 自绘（无第三方依赖）
- **存储**：健康数据用微信本地存储（`wx.setStorageSync`），用户账号 / 在线问诊用微信云开发（云数据库 + 云函数）
- **配色**：医疗蓝色主题（#1B365D / #2E86AB）

---

## 目录结构

```
ican/
├── app.js                          # 应用入口，全局登录态管理
├── app.json                        # 路由、窗口、TabBar 配置
├── app.wxss                        # 全局公共样式
├── project.config.json             # 微信小程序项目配置
├── sitemap.json
├── README.md
│
├── pages/
│   ├── login/                      # 登录页（微信授权 / 手机号 / 医生）
│   ├── index/                      # 首页 Dashboard
│   ├── detect/                     # 检测流程（拍照→AI分析）
│   ├── report/                     # 单次报告详情
│   ├── archives/                   # 报告归档列表（时间线）
│   ├── trend/                      # 趋势图（Canvas 折线图）
│   ├── family/                     # 家庭成员管理
│   ├── chat/                       # 在线问诊对话（患者/医生共用）
│   ├── doctor/                     # 医生端患者咨询列表
│   └── settings/                   # 设置页（切换账号/退出登录）
│
├── utils/
│   ├── kimi.js                     # Kimi Vision API 封装
│   ├── thresholds.js               # 条带灰度→浓度→风险 规则引擎
│   ├── analyzer.js                 # 本地 Canvas 灰度分析器
│   ├── storage.js                  # 本地存储 CRUD
│   ├── consultation.js             # 在线问诊数据操作（走云函数）
│   ├── chart.js                    # Canvas 趋势图绘制
│   └── util.js                     # 通用工具函数
│
├── components/
│   ├── empty-state/                # 空状态占位组件
│   ├── floating-btn/               # 全局悬浮问诊按钮
│   └── report-picker/              # 报告选择弹窗（分享给医生）
│
├── cloudfunctions/
│   ├── kimi-proxy/                 # Kimi Vision API 代理云函数
│   ├── consultation/               # 在线问诊云函数（权限校验）
│   └── user/                       # 用户账号云函数（注册/登录）
│
├── proxy/
│   └── server.js                   # 本地 Kimi API 代理（开发调试用）
│
└── images/                         # TabBar 图标等静态资源
```

---

## 快速开始

### 1. 环境准备

- 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册微信小程序（可使用测试号）

### 2. 打开项目

1. 启动微信开发者工具
2. 选择「导入项目」
3. 项目目录选择 `D:\4702's secret\大学\个人参加比赛文件\ican`
4. AppID 使用测试号（或替换 `project.config.json` 中的 `appid` 字段）

### 3. 配置 Kimi API Key

Kimi API Key 保存在云函数服务端（客户端不可见），需在云开发控制台配置环境变量：

1. 微信开发者工具 → 云开发控制台 → 云函数 → `kimi-proxy` → 配置
2. 添加环境变量 `KIMI_API_KEY` = 你的 Kimi API Key（[platform.moonshot.cn](https://platform.moonshot.cn) 申请）

> 未配置时 AI 分析不可用，检测会自动降级到本地 Canvas / Mock 分析。

### 4. 配置在线问诊云开发

账号注册/登录走 `user` 云函数，在线问诊走 `consultation` 云函数，需在云控制台完成：

1. 部署 `kimi-proxy`、`consultation`、`user` 三个云函数
2. 数据库集合会自动创建：`users`（账号）、`consultations`、`messages`、`doctors`
3. 集合权限建议：
   - `users` → 设为「所有用户不可读写」（账号密码仅云函数可读写，防止密码泄露）
   - `doctors` → 设为「所有用户不可读写」（仅云函数可写，防止任意用户注册成医生）
   - `consultations`、`messages` → 设为「所有用户可读」以支持实时监听（写入由云函数代管）
4. 医生登录时会自动调用 `registerDoctor` 登记当前微信身份，用于服务端权限校验
5. 患者密码为比赛演示的明文存储，生产环境需加盐哈希（如 bcrypt）

### 5. 运行

在微信开发者工具中点击「编译」，即可在模拟器中预览。

---

## 功能流程

```
登录 → 首页 → 开始检测
                  │
                  ├─ 扫码（扫描检测盒二维码）
                  ├─ 拍照（试纸图像采集）
                  ├─ AI分析（Kimi Vision）
                  └─ 生成报告 ──→ 保存至本地存储
                                    │
                        ┌───────────┼───────────┐
                        ▼           ▼           ▼
                     报告归档    健康趋势    家庭管理
                    （时间线）  （折线图）  （多成员）
```

---

## API 降级策略

当 Kimi API 不可用时（网络异常/超时/配额不足），系统自动降级为 **Mock 分析引擎**：

- 生成合理的随机检测数据
- 基于数值自动判定风险等级
- 提供对应的健康建议

---

## 本地存储数据结构

```js
{
  userInfo: { nickName, avatarUrl, phone },
  members: [{ id, name, relation, gender, age }],
  currentMember: { ... },
  reports: [{
    id, memberId, memberName, date,
    gca: { value, unit, refMin, refMax },
    afp: { value, unit, refMin, refMax },
    riskLevel, riskColor, advice,
    cLineIntensity, tLineIntensity, tcRatio,
    imagePath
  }]
}
```

---

## 版本

- **v3.0** - 2026年7月
- 定位：软硬件协同的常见肝脏疾病居家智能检测与慢性病全病程管理平台

## 免责声明

本小程序仅供健康管理参考与比赛演示，不能替代专业医疗诊断。如有身体不适请及时就医。
