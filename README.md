# 点名器 —— 高效便捷的随机点名工具

![图片描述](./example.png)

- [x] 优美的界面
- [x] 跨平台支持 可在网页端、桌面端使用
- [x] 支持 excel 导入数据，支持导入多个班级
- [x] 支持多个班级切换，删除数据
- [x] 支持设置抽取人数
- [x] 支持设置抽取速度
- [x] 支持自动完成抽取

## 网页使用
```
1. 打开src/index.html
2. 浏览器访问
```

## win 使用 
```
1、解压 build/win/win-64/沈老师点名器.exe.zip
2、打开 沈老师点名器.exe
3、同目录下的 files 文件夹支持预存数据
```

## mac 使用
```
# mac的包太大，github的上限是100mb，所以没有上传，自己进行构建
1、npm install  # 安装依赖
2、npm start # dev
3、npm run build:mac # 构建 mac 包
```

# 二次开发

## 网页
```
修改src/index.html
```

## 客户端
```shell
npm install  # 安装依赖
npm start # dev
npm run build:mac # 构建 mac 包
npm run build:win # 构建 win 包
```
