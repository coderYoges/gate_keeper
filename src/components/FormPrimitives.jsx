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
  color: #38443c;
  font-size: 11px;
  font-weight: 650;
`

export const RequiredTag = styled.span`
  color: #a2aaa3;
  font-size: 8px;
  font-weight: 750;
  letter-spacing: 0.8px;
`

const controlStyles = `
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid #e1e6e0;
  border-radius: 7px;
  background: #fff;
  color: #27332b;
  font-size: 12px;
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:focus {
    border-color: #89a96a;
    outline: none;
    box-shadow: 0 0 0 3px rgb(137 169 106 / 14%);
  }

  &:disabled {
    background: #f8faf6;
    color: #a4ada5;
    cursor: not-allowed;
  }
`

export const TextInput = styled.input`
  ${controlStyles}

  &::placeholder {
    color: #b0b8b1;
  }
`

export const SelectInput = styled.select`
  ${controlStyles}
  color: ${({ value }) => (value ? '#27332b' : '#a4ada5')};
`

export const Hint = styled.span`
  color: #939c95;
  font-size: 10px;
  line-height: 1.5;
`

export const ErrorMessage = styled.p`
  margin: 0;
  color: #a34f45;
  font-size: 10px;
  line-height: 1.5;
`

export const InputGroup = styled.div`
  display: flex;
  align-items: center;
  min-height: 44px;
  overflow: hidden;
  border: 1px solid #e1e6e0;
  border-radius: 7px;
  background: #fff;

  &:focus-within {
    border-color: #89a96a;
    box-shadow: 0 0 0 3px rgb(137 169 106 / 14%);
  }

  ${TextInput} {
    min-width: 0;
    border: 0;
    box-shadow: none;
  }
`

export const CurrencyPrefix = styled.span`
  padding-left: 12px;
  color: #78827c;
  font-size: 12px;
`

export const InlineNote = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 22px;
  padding: 11px 12px;
  border-radius: 7px;
  background: #f6f8f4;
  color: #778278;
  font-size: 10px;
  line-height: 1.5;
`

export const NoteIcon = styled.span`
  width: 15px;
  height: 15px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid #aebca4;
  border-radius: 50%;
  color: #74876a;
  font-size: 9px;
  font-weight: 700;
`

export const PanelHeading = styled.div`
  margin-bottom: 26px;
`

export const PanelKicker = styled.p`
  margin: 0 0 10px;
  color: #849080;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 1.15px;

  span {
    color: #afb7b0;
  }
`

export const PanelTitle = styled.h2`
  margin: 0 0 6px;
  color: #17231e;
  font-size: 23px;
  font-weight: 630;
  letter-spacing: -0.8px;

  @media (max-width: 600px) {
    font-size: 21px;
  }
`

export const PanelDescription = styled.p`
  margin: 0;
  color: #838d86;
  font-size: 12px;
  line-height: 1.55;
`

export const ChoiceCard = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 11px;
  grid-column: 1 / -1;
  padding: 12px;
  border: 1px solid #e4e9e1;
  border-radius: 8px;
  background: #f8faf6;
  cursor: pointer;

  @media (max-width: 600px) {
    grid-column: auto;
  }

  span {
    display: grid;
    gap: 4px;
  }

  strong {
    color: #3e4b40;
    font-size: 10px;
    font-weight: 700;
  }

  small {
    color: #7d887e;
    font-size: 10px;
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
