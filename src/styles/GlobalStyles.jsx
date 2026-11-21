import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  :root {
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #e8eee9;
    background: #0d1511;
    color-scheme: dark;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-optical-sizing: auto;
    font-weight: 400;
  }

  * {
    box-sizing: border-box;
  }

  body {
    min-width: 320px;
    min-height: 100vh;
    margin: 0;
    overflow-x: hidden;
    overflow-y: auto;
    background:
      radial-gradient(circle at 85% 8%, rgb(151 190 95 / 7%), transparent 24rem),
      #0d1511;
  }

  @keyframes panel-in {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  button,
  input,
  select {
    font: inherit;
  }

  select option {
    background: #111915;
    color: #edf3ef;
  }

  button {
    cursor: pointer;
  }

  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 3px solid #8ebc50;
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`
