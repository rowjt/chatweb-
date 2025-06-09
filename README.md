# ChatApp - 现代化聊天应用

一个功能丰富的实时聊天应用，类似Telegram，支持私聊、群聊、文件传输和管理员面板。

## 🚀 功能特性

### 用户功能
- ✅ 用户注册和登录
- ✅ 个人资料管理
- ✅ 头像上传
- ✅ 在线状态显示
- ✅ 好友系统

### 聊天功能
- ✅ 实时私聊
- ✅ 群组聊天
- ✅ 文件和图片传输
- ✅ 表情符号支持
- ✅ 消息搜索
- ✅ 消息历史记录
- ✅ 离线消息

### 群组管理
- ✅ 创建和管理群组
- ✅ 邀请和移除成员
- ✅ 群组权限管理
- ✅ 群组公告
- ✅ 群组设置

### 管理员面板
- ✅ 用户管理
- ✅ 群组监控
- ✅ 系统统计
- ✅ 内容审核
- ✅ 系统设置

## 🛠️ 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **shadcn/ui** - UI组件库
- **Socket.io Client** - 实时通信
- **React Router** - 路由管理
- **Zustand** - 状态管理

### 后端
- **Node.js** - 运行时环境
- **Express** - Web框架
- **Socket.io** - 实时通信
- **TypeScript** - 类型安全
- **Supabase** - 数据库和认证
- **Multer** - 文件上传
- **JWT** - 身份验证

### 数据库
- **PostgreSQL** - 主数据库
- **Supabase** - 数据库服务
- **Redis** - 缓存和会话存储

## 📦 项目结构

```
chat-app/
├── client/                 # React前端应用
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── hooks/         # 自定义Hooks
│   │   ├── store/         # 状态管理
│   │   ├── services/      # API服务
│   │   ├── types/         # TypeScript类型
│   │   └── utils/         # 工具函数
│   ├── public/            # 静态资源
│   └── package.json
├── server/                # Node.js后端应用
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/    # 中间件
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由定义
│   │   ├── services/      # 业务逻辑
│   │   ├── socket/        # Socket.io处理
│   │   └── utils/         # 工具函数
│   └── package.json
├── shared/                # 共享代码
│   ├── types/            # 共享类型定义
│   └── utils/            # 共享工具函数
└── docs/                 # 项目文档
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- PostgreSQL (或使用Supabase)

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/rowjt/chatweb-.git
cd chatweb-
```

2. **安装依赖**
```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

3. **环境配置**
```bash
# 复制环境变量文件
cp server/.env.example server/.env
cp client/.env.example client/.env

# 编辑环境变量
# 配置数据库连接、JWT密钥等
```

4. **数据库设置**
```bash
# 如果使用本地PostgreSQL
createdb chatapp

# 运行数据库迁移
cd server
npm run migrate
```

5. **启动应用**
```bash
# 启动后端服务 (端口3001)
cd server
npm run dev

# 启动前端应用 (端口5173)
cd client
npm run dev
```

6. **访问应用**
- 前端应用: http://localhost:5173
- 后端API: http://localhost:3001
- 管理员面板: http://localhost:5173/admin

## 📚 API文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

### 用户接口
- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户信息
- `POST /api/users/avatar` - 上传头像

### 聊天接口
- `GET /api/chats` - 获取聊天列表
- `GET /api/chats/:id/messages` - 获取聊天消息
- `POST /api/chats/:id/messages` - 发送消息
- `POST /api/chats/upload` - 上传文件

### 群组接口
- `GET /api/groups` - 获取群组列表
- `POST /api/groups` - 创建群组
- `PUT /api/groups/:id` - 更新群组信息
- `POST /api/groups/:id/members` - 添加成员
- `DELETE /api/groups/:id/members/:userId` - 移除成员

## 🔧 开发指南

### 代码规范
- 使用ESLint和Prettier进行代码格式化
- 遵循TypeScript严格模式
- 使用Conventional Commits规范

### 测试
```bash
# 运行前端测试
cd client
npm run test

# 运行后端测试
cd server
npm run test

# 运行端到端测试
npm run test:e2e
```

### 构建部署
```bash
# 构建前端
cd client
npm run build

# 构建后端
cd server
npm run build

# 启动生产环境
npm run start
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

如有问题，请通过以下方式联系：
- 创建Issue
- 发送邮件
