// 查查 · 后端入口
import 'dotenv/config'
import express from 'express'
import { chat, isMock } from './deepseek.js'
import { FOLLOWUP_SYSTEM, TRIAGE_SYSTEM, followupUserMessage, triageUserMessage } from './prompts.js'
import { check as checkRedFlags } from './redflags.js'
import { sanitize } from './sanitize.js'

const app = express()
app.use(express.json({ limit: '64kb' }))
const PORT = process.env.PORT || 8700

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mock: isMock() })
})

// 生成追问问题
app.post('/api/followup', async (req, res) => {
  const symptom = String(req.body?.symptom || '').trim()
  if (!symptom) return res.status(400).json({ error: '说下哪里不舒服' })
  try {
    const data = await chat(
      [
        { role: 'system', content: FOLLOWUP_SYSTEM },
        { role: 'user', content: followupUserMessage(symptom) }
      ],
      { mockKey: 'followup', temperature: 0.8 }
    )
    res.json({ questions: Array.isArray(data.questions) ? data.questions : [] })
  } catch (e) {
    // 日志不打印症状原文（隐私最小化）
    console.error(`[followup] fail: ${e.message}`)
    res.status(502).json({ error: '追问助手开小差了，直接看结果吧', retryable: true })
  }
})

// 生成中西医双轨报告
app.post('/api/triage', async (req, res) => {
  const symptom = String(req.body?.symptom || '').trim()
  if (!symptom) return res.status(400).json({ error: '说下哪里不舒服' })
  const answers = Array.isArray(req.body?.answers) ? req.body.answers : []
  try {
    const report = await chat(
      [
        { role: 'system', content: TRIAGE_SYSTEM },
        { role: 'user', content: triageUserMessage(symptom, answers) }
      ],
      { mockKey: 'triage', temperature: 0.5 }
    )
    // 急症关键词：命中强制升级，绝不降级
    const flag = checkRedFlags([symptom, ...answers.map((a) => a.answer)].join(' '))
    if (flag) {
      report.red_flag = { triggered: true, reason: flag.reason }
      if (flag.level === 'red') report.level = 'red'
      else if (report.level === 'green') report.level = 'yellow'
    }
    if (report.red_flag?.triggered) report.level = 'red'
    res.json(sanitize(report))
  } catch (e) {
    console.error(`[triage] fail: ${e.message}`)
    res.status(502).json({ error: '报告引擎开小差了，再试一次', retryable: true })
  }
})

app.listen(PORT, () => {
  console.log(`查查 server 已启动: http://localhost:${PORT} (mock=${isMock()})`)
})
