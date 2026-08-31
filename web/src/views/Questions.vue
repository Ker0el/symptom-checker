<script setup>
import { ref } from 'vue'

const props = defineProps({
  symptom: String,
  questions: Array,
  loading: Boolean
})
const emit = defineEmits(['submit', 'back'])

const map = ref({})

function pick (qid, opt) {
  map.value[qid] = map.value[qid] === opt ? '' : opt
}

function collect () {
  const ans = []
  for (const q of props.questions) {
    const v = (map.value[q.id] || '').trim()
    if (v) ans.push({ question: q.text, answer: v })
  }
  emit('submit', ans)
}
</script>

<template>
  <section class="questions">
    <button class="back" @click="emit('back')">← 换个说法</button>

    <h2 class="recap">你刚说：<em>{{ symptom }}</em></h2>
    <p class="fine">再答两句，报告更靠谱。不想答，直接跳过。</p>

    <div v-if="!questions.length" class="none">
      信息够详细了，直接看结果。
    </div>

    <article
      v-for="(q, i) in questions"
      :key="q.id"
      class="q-card"
      :class="{ odd: i % 2 }"
    >
      <h3>
        <span class="q-no">{{ i + 1 }}</span>
        {{ q.text }}
      </h3>
      <div class="opts">
        <button
          v-for="o in q.options"
          :key="o"
          class="opt"
          :class="{ on: map[q.id] === o }"
          @click="pick(q.id, o)"
        >
          {{ o }}
        </button>
      </div>
      <input v-model="map[q.id]" class="free" placeholder="或者自己说几句" />
    </article>

    <div class="actions">
      <button class="skip" @click="emit('submit', [])">全部跳过，直接看结果</button>
      <button class="btn" :disabled="loading" @click="collect">
        {{ loading ? '在翻书…' : '看结果 →' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.recap {
  font-family: var(--serif);
  font-size: 26px;
  margin: 26px 0 6px;
}
.recap em {
  font-style: normal;
  color: var(--cinnabar);
  border-bottom: 2px solid var(--cinnabar);
  padding-bottom: 1px;
}
.sub { margin-bottom: 8px; }

.none {
  margin-top: 40px;
  font-family: var(--serif);
  font-size: 20px;
  color: var(--ink-soft);
}

.q-card {
  background: var(--paper-deep);
  border: 2px solid var(--ink);
  padding: 22px 24px;
  margin-top: 24px;
  box-shadow: 5px 5px 0 rgba(36, 33, 26, 0.12);
  transition: transform 0.2s var(--spring);
}
.q-card.odd { margin-left: 7%; transform: rotate(0.5deg); }
.q-card.odd:hover { transform: rotate(0.5deg) translateY(-3px); }
.q-card h3 { font-size: 17.5px; display: flex; align-items: center; gap: 10px; }
.q-no {
  display: inline-flex;
  width: 26px;
  height: 26px;
  background: var(--ink);
  color: var(--paper);
  font-family: var(--serif);
  font-size: 14px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.opt {
  border: 1.5px solid var(--ink);
  background: var(--paper);
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.15s var(--spring);
}
.opt:hover { transform: translateY(-2px); }
.opt.on {
  background: var(--cinnabar);
  color: var(--paper);
  border-color: var(--cinnabar-deep);
  box-shadow: 3px 3px 0 var(--ink);
}

.free {
  width: 100%;
  margin-top: 16px;
  border: none;
  border-bottom: 1.5px dashed var(--line);
  background: transparent;
  padding: 8px 2px;
  font-size: 14.5px;
  outline: none;
}
.free:focus { border-bottom-color: var(--cinnabar); }

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 40px;
  margin-left: 7%;
}
.skip {
  background: none;
  border: none;
  color: var(--ink-soft);
  font-size: 14px;
  text-decoration: underline dotted;
  text-underline-offset: 4px;
}
.skip:hover { color: var(--cinnabar); }
</style>
