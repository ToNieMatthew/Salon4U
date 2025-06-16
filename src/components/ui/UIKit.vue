<template>
  <!-- This is just for documentation purposes -->
  <div class="ui-kit-documentation">
    <h1>Salon App UI Kit</h1>
    <div class="component-section">
      <h2>Buttons</h2>
      <div class="component-row">
        <button class="btn btn-primary">Primary Button</button>
        <button class="btn btn-secondary">Secondary</button>
        <button class="btn btn-outline">Outline</button>
        <button class="btn btn-text">Text Button</button>
        <button class="btn btn-icon"><i class="icon">+</i></button>
        <button class="btn btn-primary" disabled>Disabled</button>
      </div>
    </div>
    
    <div class="component-section">
      <h2>Cards</h2>
      <div class="component-grid">
        <div class="card">
          <div class="card-header">Standard Card</div>
          <div class="card-body">Card content goes here</div>
          <div class="card-footer">Footer actions</div>
        </div>
        <div class="card card-elevated">
          <div class="card-header">Elevated Card</div>
          <div class="card-body">With subtle shadow</div>
        </div>
        <div class="card card-border">
          <div class="card-header">Border Card</div>
          <div class="card-body">With accent border</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No logic needed for the UI kit documentation
</script>

<style>
/* This will be imported in main.css */
</style>