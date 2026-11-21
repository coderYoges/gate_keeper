import styled from 'styled-components'

export const ModalOverlay = styled.div`
  position: fixed;
  z-index: 20;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(4 8 6 / 78%);
`

export const ModalDialog = styled.div`
  width: min(420px, 100%);
  padding: 25px;
  border: 1px solid ${({ $tone }) => ($tone === 'danger' ? '#a84f45' : $tone === 'success' ? '#668f45' : '#304037')};
  border-radius: 14px;
  background: #151d18;
  box-shadow: ${({ $tone }) => ($tone === 'danger'
    ? '0 24px 80px rgb(168 79 69 / 22%)'
    : $tone === 'success'
      ? '0 24px 80px rgb(102 143 69 / 22%)'
      : '0 24px 80px rgb(0 0 0 / 48%)')};

  h2 {
    margin: 0 0 8px;
    color: ${({ $tone }) => ($tone === 'danger' ? '#f09a8e' : $tone === 'success' ? '#b1d28a' : '#edf3ef')};
    font-size: 20px;
    letter-spacing: -0.5px;
  }

  p {
    margin: 0;
    color: #adb8b0;
    font-size: 13px;
    line-height: 1.55;
  }
`

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 23px;
`

export const ModalButton = styled.button`
  min-height: 38px;
  padding: 0 15px;
  border: 1px solid ${({ $primary, $tone }) => ($primary
    ? ($tone === 'danger' ? '#d56b60' : $tone === 'success' ? '#86b85a' : '#c8f169')
    : '#334138')};
  border-radius: 7px;
  background: ${({ $primary, $tone }) => ($primary
    ? ($tone === 'danger' ? '#d56b60' : $tone === 'success' ? '#86b85a' : '#c8f169')
    : '#1a2420')};
  color: ${({ $primary }) => ($primary ? '#17231e' : '#adb8b0')};
  font-size: 12px;
  font-weight: 650;
`
