import React, { useState } from 'react'
import './App.css'
import { HealthConcernForm } from './components/HealthConcernForm'

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Health Habit Assistant</h1>
          <p>Get personalized health habit suggestions based on your needs</p>
        </div>
      </header>
      <main className="main-content">
        <HealthConcernForm />
      </main>
    </div>
  )
}

export default App
