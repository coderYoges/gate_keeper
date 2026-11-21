import './style.css'

document.querySelector('#app').innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="Gatekeeper home">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M16 3 27 7v8c0 7.1-4.5 11.6-11 14C9.5 26.6 5 22.1 5 15V7l11-4Z" />
            <path d="m11.5 16 3 3 6-7" />
          </svg>
        </span>
        <span class="brand-copy"><strong>gatekeeper</strong><small>PLAYER ACCESS</small></span>
      </a>
      <div class="topbar-status"><span class="status-pulse"></span> SYSTEM ONLINE</div>
    </header>

    <main class="page-content">
      <section class="intro">
        <div>
          <p class="eyebrow"><span class="eyebrow-line"></span> CHECKPOINT 04 <span class="eyebrow-slash">/</span> ENTRY REQUEST</p>
          <h1>Ready for what’s <span>next?</span></h1>
          <p class="intro-copy">A quick check-in, then the next part of your adventure is yours.</p>
        </div>
        <div class="flow-count"><span>01</span><i></i> 03 <small>STEPS</small></div>
      </section>

      <div class="workspace">
        <section class="flow-card" aria-labelledby="flow-heading">
          <nav class="stepper" aria-label="Access request progress">
            <div class="stepper-rail" aria-hidden="true"><span id="progress-fill"></span></div>
            <button class="step-button is-current" type="button" data-step-nav="0" aria-current="step">
              <span class="step-dot">01</span><span class="step-name">Your profile</span>
            </button>
            <button class="step-button" type="button" data-step-nav="1" disabled>
              <span class="step-dot">02</span><span class="step-name">Gate check</span>
            </button>
            <button class="step-button" type="button" data-step-nav="2" disabled>
              <span class="step-dot">03</span><span class="step-name">Review</span>
            </button>
          </nav>

          <form id="access-form" novalidate>
            <section class="step-panel" data-panel="0" aria-labelledby="profile-heading">
              <div class="panel-heading">
                <p class="panel-kicker">STEP 01 <span>—</span> PLAYER PROFILE</p>
                <h2 id="profile-heading">First, who’s playing?</h2>
                <p>Let’s make sure we’re checking the right player.</p>
              </div>
              <div class="field-grid">
                <label class="field" for="player-name">
                  <span class="field-label">Player name <b>REQUIRED</b></span>
                  <input id="player-name" name="playerName" type="text" placeholder="e.g. Alex Morgan" autocomplete="name" maxlength="48" required>
                  <span class="field-hint">The name you go by in the game.</span>
                </label>
                <label class="field" for="player-id">
                  <span class="field-label">Player ID <b>REQUIRED</b></span>
                  <input id="player-id" name="playerId" type="text" placeholder="e.g. AX-2048" autocomplete="off" maxlength="24" required>
                  <span class="field-hint">Find this in your player profile.</span>
                </label>
              </div>
              <div class="inline-note"><span class="note-icon" aria-hidden="true">i</span> Your details stay in this browser demo and aren’t sent to a server.</div>
            </section>

            <section class="step-panel" data-panel="1" aria-labelledby="gate-heading" hidden>
              <div class="panel-heading">
                <p class="panel-kicker">STEP 02 <span>—</span> GATE CHECK</p>
                <h2 id="gate-heading">Where are you headed?</h2>
                <p>Every passage has its own requirements. Let’s check yours.</p>
              </div>
              <div class="field-grid gate-fields">
                <label class="field field-wide" for="gate-select">
                  <span class="field-label">Choose a gate <b>REQUIRED</b></span>
                  <select id="gate-select" name="gate" required>
                    <option value="" selected disabled>Select your destination</option>
                    <option value="forest" data-required-level="2">Mosswood Crossing</option>
                    <option value="archive" data-required-level="5">The Crystal Archive</option>
                    <option value="citadel" data-required-level="8">Skyward Citadel</option>
                  </select>
                </label>
                <label class="field" for="player-level">
                  <span class="field-label">Your current level <b>REQUIRED</b></span>
                  <input id="player-level" name="playerLevel" type="number" placeholder="e.g. 5" min="1" max="99" inputmode="numeric" required>
                  <span class="field-hint">Enter a level from 1 to 99.</span>
                </label>
                <fieldset class="field token-field">
                  <legend class="field-label">Do you have the gate token? <b>REQUIRED</b></legend>
                  <div class="choice-row">
                    <label class="choice"><input type="radio" name="hasToken" value="yes" required><span>Yes, I have it</span></label>
                    <label class="choice"><input type="radio" name="hasToken" value="no" required><span>Not yet</span></label>
                  </div>
                </fieldset>
              </div>
              <div class="inline-note"><span class="note-icon" aria-hidden="true">i</span> Demo rule: meet the gate’s level requirement and carry its token.</div>
            </section>

            <section class="step-panel" data-panel="2" aria-labelledby="review-heading" hidden>
              <div class="panel-heading">
                <p class="panel-kicker">STEP 03 <span>—</span> FINAL REVIEW</p>
                <h2 id="review-heading">Everything look right?</h2>
                <p>Give your details one last look before we check the gate.</p>
              </div>
              <dl class="review-list">
                <div><dt>PLAYER</dt><dd id="review-player">—</dd></div>
                <div><dt>PLAYER ID</dt><dd id="review-id">—</dd></div>
                <div><dt>DESTINATION</dt><dd id="review-gate">—</dd></div>
                <div><dt>CURRENT LEVEL</dt><dd id="review-level">—</dd></div>
                <div><dt>GATE TOKEN</dt><dd id="review-token">—</dd></div>
              </dl>
              <div class="decision-result" id="decision-result" role="status" aria-live="polite" hidden></div>
            </section>

            <div class="form-footer">
              <button class="back-button" type="button" data-prev disabled><span aria-hidden="true">←</span> Back</button>
              <span class="footer-caption">YOUR PROGRESS IS SAVED IN THIS SESSION</span>
              <button class="primary-button" type="button" data-next>Continue <span aria-hidden="true">→</span></button>
              <button class="primary-button" type="submit" data-submit hidden>Check access <span aria-hidden="true">↗</span></button>
            </div>
          </form>
        </section>

        <aside class="side-column" aria-label="Gate requirements">
          <section class="gate-card">
            <div class="gate-card-top">
              <span class="gate-card-label">GATEKEEPER <span>·</span> LIVE CHECK</span>
              <span class="gate-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z" /><circle cx="12" cy="15" r="1.2" /></svg>
              </span>
            </div>
            <p class="gate-state-label">CURRENT STATUS</p>
            <h2 id="side-status">Awaiting player</h2>
            <p class="gate-state-copy" id="side-copy">Complete the steps to see if this gate is ready to open.</p>
            <div class="side-divider"></div>
            <p class="requirements-title">PASSAGE REQUIREMENTS</p>
            <div class="requirement-row"><span><i class="requirement-dot level-dot"></i> Minimum level</span><strong id="side-level">Choose a gate</strong></div>
            <div class="requirement-row"><span><i class="requirement-dot token-dot"></i> Gate token</span><strong id="side-token">Required</strong></div>
            <div class="gate-card-foot"><span class="foot-lock" aria-hidden="true">⌑</span> Your journey, your data. Always.</div>
          </section>
          <div class="side-tip">
            <span class="tip-mark" aria-hidden="true">✳</span>
            <p><strong>A fair check for every player.</strong><br>We’ll show you exactly what’s needed to pass.</p>
          </div>
        </aside>
      </div>
      <footer class="page-footer"><span>GATEKEEPER <span class="footer-dot">/</span> PLAYER ACCESS PORTAL</span><span>DEMO EXPERIENCE <span class="footer-dot">·</span> 2025</span></footer>
    </main>
  </div>
`

const form = document.querySelector('#access-form')
const panels = [...document.querySelectorAll('[data-panel]')]
const stepButtons = [...document.querySelectorAll('[data-step-nav]')]
const backButton = document.querySelector('[data-prev]')
const nextButton = document.querySelector('[data-next]')
const submitButton = document.querySelector('[data-submit]')
const progressFill = document.querySelector('#progress-fill')
const decisionResult = document.querySelector('#decision-result')
let currentStep = 0

const gateNames = {
  forest: 'Mosswood Crossing',
  archive: 'The Crystal Archive',
  citadel: 'Skyward Citadel',
}

function selectedGate() {
  const option = form.elements.gate.selectedOptions[0]
  return option?.value ? option : null
}

function validatePanel(step) {
  const panel = panels[step]
  const fields = [...panel.querySelectorAll('input, select')]

  for (const field of fields) {
    if (field.id === 'player-name') {
      field.setCustomValidity(field.value.trim() ? '' : 'Please enter a player name.')
    }

    if (!field.checkValidity()) {
      field.reportValidity()
      return false
    }
  }

  return true
}

function clearDecision() {
  decisionResult.hidden = true
  decisionResult.replaceChildren()
  document.querySelector('#side-status').textContent = 'Awaiting player'
  document.querySelector('#side-copy').textContent = 'Complete the steps to see if this gate is ready to open.'
}

function updateSummary() {
  const gate = selectedGate()
  const token = form.elements.hasToken.value

  document.querySelector('#review-player').textContent = form.elements.playerName.value.trim() || '—'
  document.querySelector('#review-id').textContent = form.elements.playerId.value.trim() || '—'
  document.querySelector('#review-gate').textContent = gate?.textContent || '—'
  document.querySelector('#review-level').textContent = form.elements.playerLevel.value ? `Level ${form.elements.playerLevel.value}` : '—'
  document.querySelector('#review-token').textContent = token ? (token === 'yes' ? 'Yes' : 'Not yet') : '—'
  document.querySelector('#side-level').textContent = gate ? `Level ${gate.dataset.requiredLevel}` : 'Choose a gate'
  document.querySelector('#side-token').textContent = 'Required'
}

function renderStep() {
  panels.forEach((panel, index) => {
    panel.hidden = index !== currentStep
  })

  stepButtons.forEach((button, index) => {
    button.classList.toggle('is-current', index === currentStep)
    button.classList.toggle('is-complete', index < currentStep)
    button.disabled = index > currentStep
    if (index === currentStep) {
      button.setAttribute('aria-current', 'step')
    } else {
      button.removeAttribute('aria-current')
    }
  })

  progressFill.style.width = `${(currentStep / (panels.length - 1)) * 100}%`
  backButton.disabled = currentStep === 0
  nextButton.hidden = currentStep === panels.length - 1
  submitButton.hidden = currentStep !== panels.length - 1
  document.querySelector('.flow-count > span').textContent = `0${currentStep + 1}`
  updateSummary()
}

function showDecision(allowed, failures, gate, level) {
  decisionResult.className = `decision-result ${allowed ? 'is-approved' : 'is-denied'}`
  decisionResult.replaceChildren()

  const icon = document.createElement('span')
  icon.className = 'decision-icon'
  icon.setAttribute('aria-hidden', 'true')
  icon.textContent = allowed ? '✓' : '!'

  const copy = document.createElement('div')
  const title = document.createElement('strong')
  title.textContent = allowed ? 'ACCESS GRANTED' : 'NOT QUITE YET'
  const message = document.createElement('p')
  message.textContent = allowed
    ? `${form.elements.playerName.value.trim()}, you’re cleared for ${gateNames[gate.value]}.`
    : failures.join(' ')
  copy.append(title, message)
  decisionResult.append(icon, copy)
  decisionResult.hidden = false

  document.querySelector('#side-status').textContent = allowed ? 'Gate cleared' : 'Requirements unmet'
  document.querySelector('#side-copy').textContent = allowed
    ? `Level ${level} verified. You’re ready to move on.`
    : 'Review the requirements and update your request to try again.'
}

document.querySelectorAll('[data-next]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!validatePanel(currentStep)) return
    currentStep = Math.min(currentStep + 1, panels.length - 1)
    clearDecision()
    renderStep()
  })
})

backButton.addEventListener('click', () => {
  currentStep = Math.max(currentStep - 1, 0)
  clearDecision()
  renderStep()
})

stepButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetStep = Number(button.dataset.stepNav)
    if (targetStep >= currentStep) return
    currentStep = targetStep
    clearDecision()
    renderStep()
  })
})

form.addEventListener('input', () => {
  clearDecision()
  updateSummary()
})
form.addEventListener('change', () => {
  clearDecision()
  updateSummary()
})

form.addEventListener('submit', (event) => {
  event.preventDefault()

  for (let step = 0; step < panels.length - 1; step += 1) {
    if (!validatePanel(step)) {
      currentStep = step
      renderStep()
      return
    }
  }

  const gate = selectedGate()
  const requiredLevel = Number(gate.dataset.requiredLevel)
  const level = Number(form.elements.playerLevel.value)
  const hasToken = form.elements.hasToken.value === 'yes'
  const failures = []

  if (level < requiredLevel) {
    failures.push(`This gate requires level ${requiredLevel}; you’re currently level ${level}.`)
  }
  if (!hasToken) {
    failures.push('You’ll also need the gate token.')
  }

  showDecision(failures.length === 0, failures, gate, level)
})

renderStep()
