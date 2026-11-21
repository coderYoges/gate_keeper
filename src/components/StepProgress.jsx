import styled from 'styled-components'

const ProgressNav = styled.nav`
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0 0 38px;
`

const Track = styled.div`
  position: absolute;
  top: 16px;
  right: 12.5%;
  left: 12.5%;
  height: 2px;
  overflow: hidden;
  background: #e8ece7;
`

const TrackFill = styled.span`
  display: block;
  width: ${({ $progress }) => `${$progress}%`};
  height: 100%;
  background: #80a94d;
  transition: width 240ms ease;
`

const StepButton = styled.button`
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ $current, $complete }) => ($current ? '#17231e' : $complete ? '#567d34' : '#a0a9a2')};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
`

const StepDot = styled.span`
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid ${({ $current, $complete }) => ($current ? '#192820' : $complete ? '#dce9d0' : '#e1e6e0')};
  border-radius: 50%;
  background: ${({ $current, $complete }) => ($current ? '#192820' : $complete ? '#eaf3e1' : '#fff')};
  color: ${({ $current, $complete }) => ($current ? '#c8f169' : $complete ? '#527b30' : '#8b958d')};
  box-shadow: ${({ $current }) => ($current ? '0 0 0 4px #eef3e9' : 'none')};
  font-size: 10px;
  font-weight: 700;
  transition: 180ms ease;
`

const StepName = styled.span`
  font-size: 11px;
  font-weight: 600;

  @media (max-width: 600px) {
    font-size: 8px;
  }
`

export function StepProgress({ currentStep, labels, onNavigate }) {
  const progress = (currentStep / (labels.length - 1)) * 100

  return (
    <ProgressNav aria-label="Pre-session check progress">
      <Track aria-hidden="true"><TrackFill $progress={progress} /></Track>
      {labels.map((label, index) => {
        const current = index === currentStep
        const complete = index < currentStep
        return (
          <StepButton
            key={label}
            type="button"
            $current={current}
            $complete={complete}
            disabled={index >= currentStep}
            aria-current={current ? 'step' : undefined}
            aria-label={`Step ${index + 1}: ${label}`}
            onClick={() => onNavigate(index)}
          >
            <StepDot $current={current} $complete={complete}>{`0${index + 1}`}</StepDot>
            <StepName>{label}</StepName>
          </StepButton>
        )
      })}
    </ProgressNav>
  )
}
