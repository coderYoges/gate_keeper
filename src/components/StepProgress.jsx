import styled from 'styled-components'

const ProgressNav = styled.nav`
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0 0 28px;
`

const Track = styled.div`
  position: absolute;
  top: 16px;
  right: 12.5%;
  left: 12.5%;
  height: 2px;
  overflow: hidden;
  background: #313d36;
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
  color: ${({ $current, $complete }) => ($current ? '#edf3ef' : $complete ? '#a8c77a' : '#748179')};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
`

const StepDot = styled.span`
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid ${({ $current, $complete }) => ($current ? '#c8f169' : $complete ? '#526a40' : '#39473f')};
  border-radius: 50%;
  background: ${({ $current, $complete }) => ($current ? '#c8f169' : $complete ? '#263820' : '#1a2420')};
  color: ${({ $current, $complete }) => ($current ? '#17231e' : $complete ? '#b7d58c' : '#8e9b93')};
  box-shadow: ${({ $current }) => ($current ? '0 0 0 4px rgb(200 241 105 / 10%)' : 'none')};
  font-size: 10px;
  font-weight: 700;
  transition: 180ms ease;
`

const StepName = styled.span`
  font-size: 12px;
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
