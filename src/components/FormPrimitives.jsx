import styled from 'styled-components'

export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 16px;

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }
`

export const Field = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  ${({ $wide }) => $wide && 'grid-column: 1 / -1;'}

  @media (max-width: 600px) {
    ${({ $wide }) => $wide && 'grid-column: auto;'}
  }
`

export const FieldLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #d5ded7;
  font-size: 12px;
  font-weight: 650;
`

export const RequiredTag = styled.span`
  color: #89978e;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.8px;
`

const controlStyles = `
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid #334138;
  border-radius: 7px;
  background: #111915;
  color: #edf3ef;
  font-size: 13px;
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:focus {
    border-color: #99bc64;
    outline: none;
    box-shadow: 0 0 0 3px rgb(153 188 100 / 14%);
  }

  &:disabled {
    background: #1b251f;
    color: #718078;
    cursor: not-allowed;
  }
`

export const TextInput = styled.input`
  ${controlStyles}

  &::placeholder {
    color: #69776f;
  }
`

export const SelectInput = styled.select`
  ${controlStyles}
  color: ${({ value }) => (value ? '#edf3ef' : '#69776f')};
`

export const Hint = styled.span`
  color: #93a098;
  font-size: 11px;
  line-height: 1.5;
`

export const ErrorMessage = styled.p`
  margin: 0;
  color: #f09a8e;
  font-size: 11px;
  line-height: 1.5;
`

export const InputGroup = styled.div`
  display: flex;
  align-items: center;
  min-height: 42px;
  overflow: hidden;
  border: 1px solid #334138;
  border-radius: 7px;
  background: #111915;

  &:focus-within {
    border-color: #99bc64;
    box-shadow: 0 0 0 3px rgb(153 188 100 / 14%);
  }

  ${TextInput} {
    min-width: 0;
    border: 0;
    box-shadow: none;
  }
`

export const CurrencyPrefix = styled.span`
  padding-left: 12px;
  color: #9aa79f;
  font-size: 13px;
`

export const InlineNote = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 14px;
  padding: 9px 12px;
  border-radius: 7px;
  background: #1b251f;
  color: #9aa69e;
  font-size: 11px;
  line-height: 1.5;
`

export const NoteIcon = styled.span`
  width: 15px;
  height: 15px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid #66805a;
  border-radius: 50%;
  color: #b1c6a0;
  font-size: 9px;
  font-weight: 700;
`

export const PanelHeading = styled.div`
  margin-bottom: 18px;
`

export const PanelKicker = styled.p`
  margin: 0 0 7px;
  color: #96a68f;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1.15px;

  span {
    color: #68756d;
  }
`

export const PanelTitle = styled.h2`
  margin: 0 0 6px;
  color: #edf3ef;
  font-size: 25px;
  font-weight: 630;
  letter-spacing: -0.8px;

  @media (max-width: 600px) {
    font-size: 21px;
  }
`

export const PanelDescription = styled.p`
  margin: 0;
  color: #99a59d;
  font-size: 13px;
  line-height: 1.55;
`

export const ChoiceCard = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 11px;
  grid-column: 1 / -1;
  padding: 12px;
  border: 1px solid #303d35;
  border-radius: 8px;
  background: #1a2420;
  cursor: pointer;

  @media (max-width: 600px) {
    grid-column: auto;
  }

  span {
    display: grid;
    gap: 4px;
  }

  strong {
    color: #d1dad3;
    font-size: 11px;
    font-weight: 700;
  }

  small {
    color: #99a49d;
    font-size: 11px;
    line-height: 1.5;
  }
`

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 15px;
  height: 15px;
  flex: 0 0 auto;
  margin: 2px 0 0;
  accent-color: #648e3e;
`
