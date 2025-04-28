<template>
    <div>
      <h4 style="margin-top: 2rem;">📆 Exposure Timeline</h4>
      <ul class="timeline">
        <li v-for="event in timelineData" :key="event.date">
          <span class="date">{{ formatDate(event.date) }}</span>
          <span class="label">{{ event.label }}</span>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  
  const props = defineProps({
    timelineData: Array
  })
  
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short'
    })
  </script>
  
  <style scoped>
  .timeline {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    border-left: 2px solid #ccc;
  }
  .timeline li {
    position: relative;
    margin-left: 1rem;
    margin-bottom: 1rem;
  }
  .timeline li::before {
    content: '';
    position: absolute;
    left: -11px;
    top: 0.4rem;
    width: 10px;
    height: 10px;
    background-color: #2196f3;
    border-radius: 50%;
  }
  .date {
    font-weight: bold;
    margin-right: 0.5rem;
  }
  .label {
    color: #555;
  }
  </style>
  