<p align="center">
  <span style="background-color:#b03a2b;color:#f4efe3;font-family:serif;font-size:32px;padding:4px 20px;letter-spacing:6px;">查</span>
</p>

<h1 align="center">查查</h1>

<p align="center"><b>先别慌，也别百度。</b></p>

<p align="center">
  输入症状，追问两句，给你一份 <b>西医 + 中医</b> 双轨参考报告。<br/>
  给家里人用的小工具。不上公网，不留记录。
</p>

---

## 它是干嘛的

你打字：`我肚子痛，拉肚子`

它先问两句：痛多久了？哪块疼？还伴着啥？

然后给你一份报告，顶上先盖个章：

| 档位 | 印章 | 什么意思 |
|---|---|---|
| 红 | 速就医 | 别犹豫，打 120 或去医院 |
| 黄 | 勿拖延 | 24 小时内去看看 |
| 绿 | 可观察 | 先在家调理，加重就升级 |

> **西医栏**：可能的原因（按常见度排）、自我护理、什么时候必须去医院。
> **中医栏**：辨证候，给食疗、穴位、中成药参考（每个药都带禁忌）。

## 它不能干嘛

- 不能开处方
- 不能代替医生
- 不能预测未来
- 急了还是打 120

## 快速开始（Windows）

```bash
# 双击 start.bat —— 自动装依赖、起服务、开浏览器
# 停：双击 stop.bat
```

不用 bat 也行：

```bash
cd server && npm i && npm start   # 后端 :8700
cd web && npm i && npm run dev    # 前端 :5178
```

浏览器打开 <http://localhost:5178>

**没 DeepSeek key 也能玩**：自动进 MOCK 模式，示例数据跑通全流程。
想接真引擎：`server/.env` 里填 `DEEPSEEK_API_KEY=sk-xxx`，删掉 `MOCK=1`。

## 技术栈

Vue 3 · Vite · Express · DeepSeek API（境内，症状不出境）· 零 UI 框架，样式全部手画

## 安全设计（写死在代码里）

- 报告引擎有**禁用词红线**：诊断、确诊、处方、治愈——不出现
- 输出还有**后置清洗**兜底，LLM 嘴漏的词强制替换
- 急症关键词**强制升级**红/黄档，绝不降级（胸痛、呼吸困难、意识不清……）
- 症状文本**不落库、不打印**，只在内存走一圈
- 每次报告固定带免责五件套

## 目录

```
symptom-checker/
├─ server/    Express 后端：追问生成 + 双轨报告 + 急症拦截 + 清洗
├─ web/       Vue3 前端：输入 → 追问 → 报告，纸墨朱砂风格
├─ start.bat  一键启动（装依赖 / 查端口 / 开浏览器）
└─ stop.bat   一键停止
```

## 二期路线

1. 中医结构化查表：SymMap 证候映射 + GB/T 15657 字典 + TCMLLM 68k 数据，LLM 只润色
2. 西医证据链：ICD-11 中文 API + MedlinePlus 链接
3. 流式输出，把 13~35 秒的等待干掉
4. 豆包降级通道

## 免责

仅供家人参考，不构成判断。急症打 120。吃药前问医生。
