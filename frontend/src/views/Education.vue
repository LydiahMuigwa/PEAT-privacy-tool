<template>
  <div class="education-container">
    <h2>🎓 Privacy Education Platform</h2>

    <div v-if="categorizedLessons.length" class="categories">
      <div v-for="(lessons, piiType) in categorizedLessons" :key="piiType" class="category">
        <h3>📌 {{ piiType }}</h3>
        <div class="lesson-grid">
          <div v-for="(lesson, index) in lessons" :key="index" class="lesson-card">
            <h4>{{ lesson.title }}</h4>
            <p>{{ lesson.description }}</p>
            <small><strong>Level:</strong> {{ lesson.level }}</small>

            <details style="margin-top: 0.5rem">
              <summary>📖 View Details</summary>
              <ul style="margin-top: 0.3rem">
                <li v-for="tip in lesson.tips" :key="tip">✔️ {{ tip }}</li>
              </ul>
              <button @click="downloadLesson(lesson)">📥 Download PDF</button>
            </details>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <p>No personalized lessons available. You're all caught up! 🎉</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import jsPDF from 'jspdf'

const categorizedLessons = ref({})

onMounted(async () => {
  const res = await fetch('http://localhost:3000/api/education')
  const allLessons = await res.json()

  // Categorize by PII
  const map = {}
  allLessons.forEach((lesson) => {
    if (!map[lesson.pii]) map[lesson.pii] = []
    map[lesson.pii].push(lesson)
  })
  categorizedLessons.value = map
})

function downloadLesson(lesson) {
  const pdf = new jsPDF()
  pdf.setFontSize(16)
  pdf.text(lesson.title, 10, 20)
  pdf.setFontSize(12)
  pdf.text(`Level: ${lesson.level}`, 10, 30)
  pdf.text("Description:", 10, 40)
  pdf.text(lesson.description, 10, 50)
  pdf.text("\nTips:", 10, 70)
  lesson.tips.forEach((tip, i) => {
    pdf.text(`- ${tip}`, 10, 80 + i * 10)
  })
  pdf.save(`${lesson.title.replace(/\s+/g, '_')}.pdf`)
}
</script>

<style scoped>
.education-container {
  padding: 2rem;
  max-width: 1000px;
  margin: auto;
}
.categories {
  margin-top: 2rem;
}
.lesson-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
.lesson-card {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}
.lesson-card:hover {
  transform: scale(1.01);
}
button {
  margin-top: 0.7rem;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background: #2563eb;
}
</style>
