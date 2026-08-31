<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { checkRed } from '../utils/redflags'

const props = defineProps({ loading: Boolean, error: String })
const emit = defineEmits(['start'])

const text = ref('')
const flag = computed(() => checkRed(text.value))
const canSubmit = computed(() => text.value.trim().length >= 2)
const EXAMPLES = ['我肚子痛，拉肚子', '头晕三天了', '一咳嗽就胸口疼']

function submit () {
  if (canSubmit.value) emit('start', text.value.trim())
}
</script>

<template>
  <section class="home">
    <div class="title">
      <h2>哪里不舒服？</h2>
      <p class="fine">
        说人话就行，不用专业词。<br />
        不问出处，不存记录，就咱们家自己用。
      </p>
    </div>

    <div class="input-wrap" :class="{ alarmed: flag }">
      <textarea
        v-model="text"
        :placeholder="'比如：我肚子痛，拉肚子'"
        rows="3"
        @keydown.enter.exact.prevent="submit"
      ></textarea>
      <div class="hint-row">
        <span class="fine">{{ text.length }} 字</span>
        <button class="btn" :disabled="!canSubmit || loading" @click="submit">
          {{ loading ? '在想…' : '先问两句 →' }}
        </button>
      </div>

      <div v-if="flag" class="red-strip">
        <Icon icon="mdi:alert-octagon" width="20" />
        <div>
          <strong>先别用这个工具。</strong>{{ flag.reason }}。
          <b>直接打 120 或去医院。</b>
        </div>
      </div>
      <p v-else class="fine note">仅供家人参考，不构成判断。急症打 120。</p>
    </div>

    <div class="examples">
      <span class="fine">拿不准说啥？试试：</span>
      <button v-for="ex in EXAMPLES" :key="ex" class="example" @click="text = ex">
        {{ ex }}
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<style scoped>
.home { position: relative; }
.title { margin: 0 0 36px 6%; }
.title h2 {
  font-family: var(--serif);
  font-size: 46px;
  letter-spacing: 6px;
  margin-bottom: 10px;
}
.title p { line-height: 1.9; }

.input-wrap {
  max-width: 620px;
  margin-left: 10%;
  background: var(--paper-deep);
  border: 2px solid var(--ink);
  box-shadow: 8px 8px 0 rgba(36, 33, 26, 0.14);
  padding: 22px;
  transition: box-shadow 0.2s var(--spring);
}
.input-wrap.alarmed { box-shadow: 8px 8px 0 var(--cinnabar); }

textarea {
  width: 100%;
  border: none;
  background: transparent;
  resize: none;
  font-size: 20px;
  line-height: 1.7;
  outline: none;
  color: var(--ink);
}
textarea::placeholder { color: rgba(107, 100, 85, 0.7); }

.hint-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.red-strip {
  margin-top: 16px;
  background: var(--cinnabar);
  color: var(--paper);
  padding: 12px 14px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 14.5px;
  line-height: 1.6;
}
.red-strip strong { font-size: 15.5px; }

.note { margin-top: 12px; }

.examples {
  margin: 26px 0 0 10%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.example {
  background: none;
  border: 1.5px solid var(--line);
  color: var(--ink-soft);
  font-size: 13px;
  padding: 6px 12px;
  transition: all 0.15s var(--spring);
}
.example:hover {
  border-color: var(--cinnabar);
  color: var(--cinnabar);
  transform: translateY(-2px);
}
</style>
