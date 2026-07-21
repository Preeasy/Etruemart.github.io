# eTruemart

eTruemart - 跨境商品采购 + 智能物流 + 社交分销一体化平台的纯前端展示网站。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式**: Tailwind CSS 3
- **路由**: React Router DOM v6 (Hash Router)
- **图标**: Lucide React

## 功能特性

### 前台页面

- **首页**: 轮播横幅、特色服务、商品分类、热门商品、促销横幅、新品推荐、客户评价、数据统计、邮件订阅
- **商品列表**: 搜索、分类筛选、价格筛选、评分筛选、排序、网格/列表视图
- **商品详情**: 图片画廊、规格选择、数量调整、加入购物车、立即购买、商品描述、用户评价、物流信息
- **关于我们**: 公司介绍、团队展示、发展历程、核心价值观
- **联系我们**: 联系表单、常见问题、联系方式、社交媒体

### 设计亮点

- 🎨 现代化 UI 设计，渐变色彩搭配
- 📱 完全响应式布局，适配各种屏幕尺寸
- ⚡ 流畅的动画效果和交互体验
- 🌍 支持 GitHub Pages 直接部署
- 🔍 SEO 友好的页面结构

## 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

访问 `http://localhost:5173` 查看网站。

### 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist` 目录。

### 预览生产版本

```bash
npm run preview
```

## 部署到 GitHub Pages

### 方式一：GitHub Actions 自动部署（推荐）

1. 将代码推送到 GitHub 仓库的 `main` 分支
2. 在仓库设置中启用 GitHub Pages
3. 选择 "GitHub Actions" 作为构建和部署来源
4. 每次推送到 `main` 分支都会自动构建和部署

### 方式二：手动部署

```bash
npm run deploy
```

这会构建项目并使用 `gh-pages` 工具部署到 `gh-pages` 分支。

## 项目结构

```
├── src/
│   ├── components/       # 可复用组件
│   │   ├── Navbar.tsx    # 导航栏
│   │   ├── Footer.tsx    # 页脚
│   │   └── ProductCard.tsx # 商品卡片
│   ├── data/             # 模拟数据
│   │   └── products.ts   # 商品和分类数据
│   ├── pages/            # 页面组件
│   │   ├── Home.tsx      # 首页
│   │   ├── Products.tsx  # 商品列表
│   │   ├── ProductDetail.tsx # 商品详情
│   │   ├── About.tsx     # 关于我们
│   │   └── Contact.tsx   # 联系我们
│   ├── App.tsx           # 应用入口组件
│   ├── main.tsx          # 应用入口
│   └── index.css         # 全局样式
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Pages 部署工作流
├── public/               # 静态资源
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── vite.config.ts        # Vite 配置
├── tailwind.config.js    # Tailwind 配置
├── postcss.config.js     # PostCSS 配置
└── tsconfig.json         # TypeScript 配置
```

## License

MIT
