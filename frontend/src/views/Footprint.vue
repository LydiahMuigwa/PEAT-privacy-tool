<template>
  <div style="padding: 2rem; display: flex; flex-direction: column; align-items: center;">
    <h2>Digital Footprint Scanner</h2>

    <form @submit.prevent="analyzeExposure" style="margin-bottom: 1rem; width: 100%; max-width: 600px; display: flex; gap: 0.5rem;">
      <input
        v-model="profileUrl"
        placeholder="Enter LinkedIn profile URL"
        style="flex: 1; padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc;"
      />
      <button
        type="submit"
        style="padding: 0.5rem 1rem; background-color: #1d4ed8; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Analyze
      </button>
    </form>

    <div v-if="loading" style="margin-top: 1rem;">⏳ Analyzing exposure, hang tight...</div>

    <div
      v-if="response && !loading"
      style="margin-top: 2rem; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); width: 100%; max-width: 1200px;"
    >
      <h3>🔎 Scan Results for:</h3>
      <p><strong>{{ response.url }}</strong></p>

      <h4>📦 Data Found:</h4>
      <ul>
        <li v-for="item in response.dataFound" :key="item">✅ {{ item }}</li>
      </ul>

      <div
        v-if="response.dataFound?.length"
        style="margin-top: 2rem; max-width: 400px; width: 100%; margin-bottom: 2rem;"
      >
        <h4>📊 Exposure Overview</h4>
        <DonutChart :labels="response.dataFound" :values="response.dataFound.map(() => 1)" />
      </div>

      <h4>🧠 Risk Score:</h4>
      <p :style="getScoreStyle(score)">{{ score }} / 100 – <strong>{{ getRiskLevel(score) }}</strong></p>

      <div style="margin-top: 1rem;">
        <div style="height: 20px; background: #eee; border-radius: 10px; overflow: hidden;">
          <div
            :style="{
              width: score + '%',
              background: getScoreStyle(score).background,
              height: '100%',
              transition: 'width 0.5s ease-in-out'
            }"
          ></div>
        </div>
      </div>

      <h4 style="margin-top: 1.5rem;">🛡️ Detected PII Exposure:</h4>
      <div style="margin-bottom: 1rem;">
        <span
          v-for="pii in response.piiExposed"
          :key="pii"
          style="display: inline-block; background: #e74c3c; color: white; padding: 4px 8px; border-radius: 6px; margin: 4px; font-size: 0.85rem;"
        >
          ⚠️ {{ pii }}
        </span>
      </div>

      <h4>⚠️ Potential Risks:</h4>
      <ul>
        <li v-for="risk in response.potentialRisks" :key="risk">❗ {{ risk }}</li>
      </ul>

      <h4>🌿 Privacy Tips:</h4>
      <ul>
        <li v-for="tip in response.privacyTips" :key="tip">✅ {{ tip }}</li>
      </ul>

      <h4>📚 Personalized Learning:</h4>
      <ul>
        <li v-for="lesson in response.educationSuggestions" :key="lesson.title">
          <strong>{{ lesson.title }}</strong>
          <span style="margin-left: 0.5rem; font-size: 0.85rem; color: gray;">({{ lesson.level }})</span>
        </li>
      </ul>

      <TimelineChart v-if="response.timeline?.length" :timelineData="response.timeline" />

      <div v-if="response.simulatedAttacks?.length" style="margin-top: 2rem;">
        <h4>🧪 Simulated Attack Demonstrations:</h4>
        <div
          v-for="(attack, index) in response.simulatedAttacks"
          :key="index"
          style="margin-bottom: 1.5rem; padding: 1rem; background: #fef2f2; border-left: 5px solid #dc2626; border-radius: 6px;"
        >
          <p><strong>{{ attack.type }}</strong> (🎯 {{ attack.attackerGoal }})</p>
          <p><em>Subject:</em> {{ attack.subject }}</p>
          <details>
            <summary style="cursor: pointer; margin-top: 0.5rem; color: #dc2626;">📬 View Message</summary>
            <pre style="white-space: pre-wrap; background: #fff; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px; margin-top: 0.5rem;">{{ attack.message }}</pre>
          </details>

          <button @click="explainThisAttack(index)" style="margin-top: 0.7rem; background: #3b82f6; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 5px; cursor: pointer;">
            🧠 Explain This Attack
          </button>

          <div v-if="attack.explained">
            <p style="margin-top: 1rem; background: #f0fdf4; padding: 1rem; border-radius: 5px;">{{ attack.explained }}</p>
          </div>
          <div v-else-if="attack.loading">
            <p style="margin-top: 1rem; font-style: italic; color: gray;">⏳ Thinking like a hacker...</p>
          </div>

          <div v-if="attack.quiz">
            <h4 style="margin-top: 1rem;">🧪 Quiz: Spot the Red Flags</h4>
            <div v-for="(question, qIndex) in attack.quiz" :key="qIndex">
              <label>
                <input type="checkbox" v-model="question.selected" />
                {{ question.text }}
              </label>
            </div>
            <button @click="checkQuizAnswers(attack)" style="margin-top: 0.5rem; background: #10b981; color: white; padding: 0.3rem 0.6rem; border: none; border-radius: 4px;">✅ Check Answers</button>
            <div v-if="attack.quizScore !== undefined">
              <p :style="{ color: attack.quizScore === attack.quiz.length ? 'green' : 'red', marginTop: '0.5rem' }">
                {{ attack.quizScore === attack.quiz.length ? '✅ Correct! 🕵️‍♂️ You spotted all red flags!' : `⚠️ You missed ${attack.quiz.length - attack.quizScore} red flag(s)` }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p style="margin-top: 1rem;"><em>{{ response.message }}</em></p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DonutChart from '../components/DonutChart.vue'
import TimelineChart from '../components/TimelineChart.vue'

const profileUrl = ref('')
const response = ref(null)
const loading = ref(false)

const analyzeExposure = async () => {
  response.value = null
  loading.value = true

  try {
    const res = await fetch('http://localhost:3000/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: profileUrl.value })
    })
    response.value = await res.json()
    if (response.value.educationSuggestions) {
      localStorage.setItem('educationSuggestions', JSON.stringify(response.value.educationSuggestions))
    }
  } catch (err) {
    response.value = { error: 'Failed to connect to backend.' }
  } finally {
    loading.value = false
  }
}

const explainThisAttack = async (index) => {
  const attack = response.value.simulatedAttacks[index]
  attack.loading = true

  try {
    const res = await fetch('http://localhost:3000/api/explain-attack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: response.value.profileMeta || {},
        piiExposed: response.value.piiExposed,
        simulatedAttacks: [attack]
      })
    })
    const data = await res.json()
    attack.explained = data.explanation
    attack.quiz = data.quiz || []
    attack.quiz.forEach(q => q.selected = false)
  } catch (err) {
    attack.explained = '⚠️ Failed to explain this attack.'
  } finally {
    attack.loading = false
  }
}

const checkQuizAnswers = (attack) => {
  const correct = attack.quiz.filter(q => q.isRedFlag && q.selected).length
  attack.quizScore = correct
}

const score = computed(() => {
  const base = 50
  const bonus =
    (response.value?.dataFound?.length || 0) * 5 +
    (response.value?.potentialRisks?.length || 0) * 10
  return Math.min(base + bonus, 100)
})

const getRiskLevel = (score) => {
  if (score < 40) return 'Low'
  if (score < 70) return 'Moderate'
  return 'High'
}

const getScoreStyle = (score) => {
  const level = getRiskLevel(score)
  return {
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    color: 'white',
    display: 'inline-block',
    background:
      level === 'Low' ? '#2ecc71' : level === 'Moderate' ? '#f1c40f' : '#e74c3c'
  }
}
</script>
