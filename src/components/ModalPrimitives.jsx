import styled from 'styled-components'

export const ModalOverlay = styled.div`
  position: fixed;
  z-index: 20;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(17 28 21 / 55%);
`

export const ModalDialog = styled.div`
  width: min(420px, 100%);
  padding: 25px;
  border: 1px solid #e7eae6;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 24px 80px rgb(0 0 0 / 22%);

  h2 {
    margin: 0 0 8px;
    color: #17231e;
    font-size: 20px;
    letter-spacing: -0.5px;
  }

  p {
    margin: 0;
    color: #68746b;
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
  border: 1px solid ${({ $primary }) => ($primary ? '#192820' : '#e1e6e0')};
  border-radius: 7px;
  background: ${({ $primary }) => ($primary ? '#192820' : '#fff')};
  color: ${({ $primary }) => ($primary ? '#fff' : '#68746b')};
  font-size: 12px;
  font-weight: 650;
`
