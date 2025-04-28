<template>
    <nav style="padding: 1rem; background: #1d3557; color: white; display: flex; justify-content: space-between; align-items: center;">
      <div><strong>PEAT</strong> – Privacy Exposure Analysis Tool</div>
      <div>
        <router-link to="/" style="color: white; margin-right: 1rem;">Home</router-link>
        <router-link to="/footprint" style="color: white;">Digital Footprint</router-link>
        <router-link to="/education">📚 Education</router-link>

      </div>
    </nav>
  </template>
  
  <script setup></script>
  
  <style scoped>
  a.router-link-active {
    text-decoration: underline;
  }
  </style>
  