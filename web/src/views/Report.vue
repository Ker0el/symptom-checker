<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({ symptom: String, report: Object })
const emit = defineEmits(['reset'])

const w = computed(() => props.report?.western || {})
const t = computed(() => props.report?.tcm || {})

const LEVEL = {
  red: { title: '别犹豫，现在就去医院', sub: '急症不是小事，工具到此为止', cls: 'red' },
  yellow: { title: '这两天去看看吧', sub: '别拖到周末才后悔', cls: 'yellow' },
  green: { title: '先在家观察', sub: '有变化就升级，别硬扛', cls: 'green' }
}
const STAMP = { red: '速就医', yellow: '勿拖延', green: '可观察' }
const level = computed(() => LEVEL[props.report?.level] || LEVEL.green)
const stamp = computed(() => STAMP[props.report?.level] || STAMP.green)
</script>

<template>
  <section class="report">
    <div class="banner" :class="level.cls">
      <div class="stamp" :class="level.cls">{{ stamp }}</div>
      <div class="banner-text">
        <h2>{{ level.title }}</h2>
        <p v-if="report.red_flag?.triggered" class="why">
          <Icon icon="mdi:alert-octagon" width="16" />
          {{ report.red_flag.reason }} —— 直接打 120，别用这个工具。
        </p>
        <p>{{ level.sub }}</p>
      </div>
    </div>

    <div class="quote">
      <span class="qmark">「</span>
      {{ report.summary }}
      <span class="qmark">」</span>
    </div>
    <p class="fine who">刚才问的是：{{ symptom }}</p>

    <div class="cols">
      <!-- 西医栏 -->
      <article class="col western">
        <h3 class="col-title">
          <Icon icon="mdi:stethoscope" width="20" />
          西医怎么看
        </h3>

        <ul class="poss">
          <li v-for="(p, i) in (w.possibilities || [])" :key="i" class="poss-item">
            <div class="p-head">
              <span class="idx">{{ i + 1 }}</span>
              <strong>{{ p.name }}</strong>
              <em class="common" :class="'c-' + p.common">{{ p.common }}</em>
            </div>
            <p class="p-desc">{{ p.desc }}</p>
            <p class="p-advice">→ {{ p.advice }}</p>
          </li>
        </ul>

        <div class="block">
          <h4>先这么办</h4>
          <ul>
            <li v-for="(s, i) in (w.self_care || [])" :key="i">{{ s }}</li>
          </ul>
        </div>

        <div class="block warn">
          <h4>什么时候必须去医院</h4>
          <p>{{ w.when_to_see_doctor }}</p>
        </div>
      </article>

      <!-- 中医栏 -->
      <article class="col tcm">
        <h3 class="col-title">
          <Icon icon="mdi:yin-yang" width="20" />
          中医怎么看
        </h3>

        <div v-for="(z, i) in (t.zheng_hou || [])" :key="i" class="zh-card">
          <strong>{{ z.name }}</strong>
          <p>{{ z.desc }}</p>
        </div>

        <div class="block">
          <h4>食疗</h4>
          <ul>
            <li v-for="(s, i) in (t.shi_liao || [])" :key="i">{{ s }}</li>
          </ul>
        </div>

        <div class="block">
          <h4>按按这些地方</h4>
          <ul>
            <li v-for="(s, i) in (t.acupoints || [])" :key="i">{{ s }}</li>
          </ul>
        </div>

        <div class="block" v-if="(t.otc || []).length">
          <h4>中成药参考</h4>
          <div v-for="(o, i) in t.otc" :key="i" class="otc">
            <strong>{{ o.name }}</strong>
            <p>{{ o.suitable_for }}</p>
            <p class="caution">
              <Icon icon="mdi:alert-outline" width="14" />
              {{ o.caution }}
            </p>
          </div>
        </div>
      </article>
    </div>

    <div class="disclaimer">
      <p>① 查查是家庭健康参考，不是医生，不出判断</p>
      <p>② 所有内容仅供参考，据此行动后果自负</p>
      <p>③ 急症（胸痛、呼吸困难、意识不清、大出血）直接打 120</p>
      <p>④ 这里不回答用药剂量，药按说明书吃，不确定看医生</p>
      <p>⑤ 过敏史、怀孕、慢性病，用药前先问医生</p>
    </div>

    <div class="actions">
      <button class="btn" @click="emit('reset')">再问一次</button>
    </div>
  </section>
</template>

<style scoped>
.banner {
  position: relative;
  border: 2px solid var(--ink);
  padding: 26px 30px 26px 118px;
  box-shadow: 7px 7px 0 rgba(36, 33, 26, 0.14);
  overflow: hidden;
}
.banner.red { background: var(--cinnabar); color: var(--paper); }
.banner.yellow { background: var(--amber); }
.banner.green { background: var(--pine); color: var(--paper); }
.banner h2 { font-family: var(--serif); font-size: 30px; letter-spacing: 3px; }
.banner .why {
  margin-top: 8px;
  font-size: 14.5px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-weight: 700;
}
.banner p { margin-top: 4px; font-size: 14px; }

.stamp {
  position: absolute;
  left: 26px;
  top: 50%;
  transform: translateY(-50%) rotate(-8deg);
  border: 3px solid currentColor;
  padding: 8px 10px;
  font-family: var(--serif);
  font-size: 22px;
  letter-spacing: 4px;
  background: var(--paper);
  color: var(--ink);
}
.stamp.red { background: var(--paper); color: var(--cinnabar); }
.stamp.yellow { color: var(--amber-deep); }
.stamp.green { color: var(--pine); }

.quote {
  font-family: var(--serif);
  font-size: 24px;
  margin: 34px 0 4px 8%;
  letter-spacing: 1px;
}
.qmark { color: var(--cinnabar); }
.who { margin: 4px 0 0 9%; }

.cols {
  display: grid;
  grid-template-columns: 55fr 45fr;
  gap: 34px;
  margin-top: 30px;
}
.col-title {
  font-family: var(--serif);
  font-size: 22px;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--ink);
}
.col.tcm { padding-top: 52px; } /* 中医栏错落下沉 */

.poss { list-style: none; }
.poss-item {
  border-bottom: 1px dashed var(--line);
  padding: 16px 0;
}
.p-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.idx {
  width: 24px;
  height: 24px;
  border: 1.5px solid var(--ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--serif);
  font-size: 13px;
  flex-shrink: 0;
}
.p-head strong { font-size: 16px; }
.common { font-style: normal; font-size: 11.5px; padding: 2px 8px; border: 1px solid; color: var(--ink-soft); border-color: var(--line); }
.c-常见 { color: var(--cinnabar); border-color: var(--cinnabar); }
.c-较常见, .c-较常见 { color: var(--amber-deep); border-color: var(--amber); }
.c-少见, .c-较少见, .c-罕见 { color: var(--pine); border-color: var(--pine); }
.p-desc { font-size: 14px; color: var(--ink-soft); margin: 6px 0 4px 34px; }
.p-advice { font-size: 14px; margin-left: 34px; color: var(--ink); }

.block.warn { border-color: var(--amber); }
.block.warn h4 { color: var(--amber-deep); }
.block.warn p { font-size: 14.5px; }

.zh-card {
  background: var(--paper-deep);
  border: 2px solid var(--cinnabar);
  border-left-width: 8px;
  padding: 14px 16px;
  margin-top: 18px;
}
.zh-card strong { font-family: var(--serif); font-size: 18px; color: var(--cinnabar-deep); }
.zh-card p { font-size: 14px; color: var(--ink-soft); margin-top: 4px; }

.otc {
  border-top: 1px dashed var(--line);
  padding: 12px 0;
}
.otc:first-of-type { border-top: none; }
.otc strong { font-size: 15.5px; }
.otc p { font-size: 13.5px; color: var(--ink-soft); margin-top: 3px; }
.otc .caution {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  color: var(--cinnabar-deep);
  font-weight: 600;
}

.disclaimer {
  margin-top: 44px;
  border: 1.5px dashed var(--line);
  padding: 18px 22px;
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 2.1;
}

.actions { margin-top: 30px; text-align: center; }

@media (max-width: 860px) {
  .cols { grid-template-columns: 1fr; gap: 0; }
  .col.tcm { padding-top: 30px; }
  .banner { padding-left: 30px; }
  .stamp { position: static; transform: rotate(-4deg); display: inline-block; margin-bottom: 10px; }
}
</style>
