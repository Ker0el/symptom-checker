// DeepSeek 封装：OpenAI 兼容端点 + MOCK 模式（无 key 也能跑）
import 'dotenv/config'

const KEY = process.env.DEEPSEEK_API_KEY || ''
export const MOCK = process.env.MOCK === '1' || !KEY
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'
const BASE = 'https://api.deepseek.com/chat/completions'
const TIMEOUT = 30000

export function isMock () { return MOCK }

function sleep (ms) { return new Promise((r) => setTimeout(r, ms)) }

// LLM 偶发在 JSON 外面包 ```json 或废话，兜底提取
function parseJson (content) {
  try { return JSON.parse(content) } catch { /* 继续兜底 */ }
  const m = content.match(/\{[\s\S]*\}/)
  if (m) {
    try { return JSON.parse(m[0]) } catch { /* 继续 */ }
  }
  throw new Error('DeepSeek 输出不是合法 JSON: ' + content.slice(0, 120))
}

// 内置示例数据，跑通全流程用（肚子痛场景）
const MOCKS = {
  followup: {
    questions: [
      { id: 'q1', text: '痛了多久了？', options: ['刚痛，几小时', '一两天了', '好几天了', '反反复复一阵子'] },
      { id: 'q2', text: '肚子哪一块疼？', options: ['上腹（胃那片）', '肚脐周围', '右下腹', '整个肚子，说不好'] },
      { id: 'q3', text: '还伴着啥？', options: ['拉肚子', '恶心反酸', '发烧', '胀气放屁', '啥都没有'] }
    ]
  },
  triage: {
    red_flag: { triggered: false, reason: '' },
    level: 'green',
    summary: '多半是吃坏了，先别慌。',
    western: {
      possibilities: [
        { name: '急性胃肠炎（吃坏了）', common: '常见', desc: '肚子痛加拉肚子，最典型的组合，多半跟不干净的食物有关。', advice: '清淡饮食，多喝温水，观察一天。' },
        { name: '肠易激综合征', common: '较常见', desc: '紧张或饮食刺激后腹痛腹胀，排完便好一点。', advice: '规律作息，少吃生冷，记一下发作规律。' },
        { name: '胃食管反流', common: '较常见', desc: '上腹烧灼感，饭后躺下更明显。', advice: '饭后别马上躺，少喝浓茶咖啡。' },
        { name: '阑尾炎（需要排除）', common: '少见', desc: '痛从肚脐游走到右下腹，按压更痛，可能发烧。', advice: '右下腹按压痛、痛在加重，马上就医。' }
      ],
      self_care: ['喝温水，少量多次', '吃清淡的粥或面条', '先别碰油腻辛辣', '热水袋敷肚子', '记好拉了几次'],
      when_to_see_doctor: '痛到直不起腰、发高烧、拉出血、吐个不停——别扛，去医院。'
    },
    tcm: {
      zheng_hou: [
        { name: '寒湿困脾', desc: '受凉加饮食生冷，肚子凉痛、想热敷，多半是这个。' },
        { name: '食滞胃肠', desc: '吃多了不消化，胀气、反酸、口气重。' }
      ],
      shi_liao: ['生姜红糖水，温胃散寒', '陈皮煮粥，理气消食', '山药小米粥，养脾胃'],
      acupoints: ['足三里：膝下三寸，按揉到酸胀', '中脘：肚脐上四寸，顺时针揉', '内关：腕横纹上两寸，止恶心'],
      otc: [
        { name: '保济丸', suitable_for: '吃坏肚子、吐泻、消化不良', caution: '孕妇慎用，吃两天没好转就看医生' },
        { name: '藿香正气水', suitable_for: '受凉加湿气重，肚子冷痛胀', caution: '含酒精，吃头孢别喝，开车别喝' }
      ]
    }
  }
}

// 调用 LLM，返回解析好的 JSON
export async function chat (messages, { json = true, mockKey = '', temperature = 0.6 } = {}) {
  if (MOCK) {
    const data = MOCKS[mockKey]
    if (!data) throw new Error('mockKey 不存在: ' + mockKey)
    await sleep(400) // 像真的在思考
    return JSON.parse(JSON.stringify(data)) // 拷贝，防调用方误改
  }

  const body = {
    model: MODEL,
    messages,
    temperature,
    stream: false
  }
  // DeepSeek json_object 模式要求消息里出现 "json" 字样（prompts 里已有）
  if (json) body.response_format = { type: 'json_object' }

  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT)
    try {
      const res = await fetch(BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${KEY}`
        },
        body: JSON.stringify(body),
        signal: ctrl.signal
      })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
      const data = await res.json()
      const content = data.choices?.[0]?.message?.content
      if (!content) throw new Error('DeepSeek 返回空内容')
      return parseJson(content)
    } catch (e) {
      clearTimeout(timer)
      // 网络类错误重试一次；业务错误（HTTP 4xx）直接抛
      if (attempt === 0 && (e.name === 'AbortError' || /HTTP 5|fetch failed|ECONNRESET/i.test(e.message))) {
        await sleep(500)
        continue
      }
      throw e
    }
  }
}
