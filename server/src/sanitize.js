// 后置清洗：LLM 嘴漏的禁用词，返回前强制替换（prompt 是第一道，这里是双保险）

const REPLACEMENTS = [
  ['确诊', '判断'],
  ['诊断', '判断'],
  ['治疗', '调理'],
  ['治愈', '缓解'],
  ['根治', '缓解'],
  ['包治', '缓解'],
  ['特效', '有效'],
  ['处方', '用药方向'],
]

export function sanitizeText (text) {
  let out = text
  for (const [from, to] of REPLACEMENTS) {
    out = out.split(from).join(to)
  }
  return out
}

// 递归清洗整个报告对象
export function sanitize (obj) {
  const walk = (v) => {
    if (typeof v === 'string') return sanitizeText(v)
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const o = {}
      for (const k of Object.keys(v)) o[k] = walk(v[k])
      return o
    }
    return v
  }
  return walk(obj)
}
