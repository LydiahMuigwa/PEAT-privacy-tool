<template>
  <div>
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { computed } from 'vue'

// Register required components
ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  labels: Array,
  values: Array
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'],
      data: props.values
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}
</script>

<style scoped>
div {
  height: 250px;
  width: 250px;
  margin: auto;
}
</style>
