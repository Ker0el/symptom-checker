<script setup>
import { ref } from 'vue'
import Home from './views/Home.vue'
import Questions from './views/Questions.vue'
import Report from './views/Report.vue'

const view = ref('home')
const symptom = ref('')
const questions = ref([])
const answers = ref([])
const report = ref(null)
const error = ref('')
const loading = ref(false)

async function start (text) {
  symptom.value = text
  error.value = ''
  loading.value = true
  try {
    const r = await fetch('/api/followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptom: text })
    })
    const d = await r.json()
    questions.value = d.questions || []
  } catch {
    questions.value = []
  }
  loading.value = false
  view.value = 'questions'
}

async function goReport (ans) {
  answers.value = ans || []
  loading.value = true
  try {
    const r = await fetch('/api/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptom: symptom.value, answers: answers.value })
    })
    const d = await r.json()
    if (d.error) {
      error.value = d.error
      view.value = 'home'
      return
    }
    report.value = d
    view.value = 'report'
  } catch {
    error.value = '报告引擎开小差了，再试一次'
    view.value = 'home'
  } finally {
    loading.value = false
  }
}

function reset () {
  view.value = 'home'
  report.value = null
  questions.value = []
  answers.value = []
  error.value = ''
}
</script>

<template>
  <div class="shell">
    <header>
      <div class="brand">
        <span class="seal">查</span>
        <div class="brand-text">
          <h1>查查</h1>
          <p>先别慌，也别百度</p>
        </div>
      </div>
      <span class="fine tag">家人私用 · 仅供参考</span>
    </header>

    <main>
      <Transition name="view" mode="out-in">
        <Home
          v-if="view === 'home'"
          key="home"
          :loading="loading"
          :error="error"
          @start="start"
        />
        <Questions
          v-else-if="view === 'questions'"
          key="questions"
          :symptom="symptom"
          :questions="questions"
          :loading="loading"
          @submit="goReport"
          @back="view = 'home'"
        />
        <Report
          v-else
          key="report"
          :symptom="symptom"
          :report="report"
          @reset="reset"
        />
      </Transition>
    </main>

    <footer class="fine">不是医生 · 不出判断 · 急症打 120</footer>
  </div>
</template>

<style scoped>
.shell {
  max-width: 940px;
  margin: 0 auto;
  padding: 28px 24px 60px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48px;
}
.brand { display: flex; align-items: center; gap: 14px; }
.seal {
  width: 46px;
  height: 46px;
  background: var(--cinnabar);
  color: var(--paper);
  font-family: var(--serif);
  font-size: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-6deg);
  box-shadow: 3px 3px 0 rgba(36, 33, 26, 0.25);
}
.brand h1 { font-family: var(--serif); font-size: 26px; letter-spacing: 2px; }
.brand p { font-size: 12.5px; color: var(--ink-soft); margin-top: -2px; }
.tag { border: 1px dashed var(--line); padding: 4px 10px; }

main { flex: 1; }
footer {
  margin-top: 64px;
  text-align: right;
  letter-spacing: 1px;
}
</style>
