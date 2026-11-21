import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { PLAYER_IDS } from '../constants'
import { getSessionRecords } from '../firebase'

const Page = styled.main`
  width: min(1192px, calc(100% - 64px));
  min-height: 100vh;
  margin: 0 auto;
  padding-bottom: 32px;

  @media (max-width: 600px) {
    width: calc(100% - 28px);
  }
`

const Topbar = styled.header`
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #26332c;

  strong {
    color: #edf3ef;
    font-size: 17px;
    letter-spacing: -0.5px;
  }
`

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 18px;

  a {
    color: #a6b1a9;
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
  }

  a[aria-current='page'] {
    color: #c8f169;
  }
`

const Content = styled.section`
  padding: 32px 0;
`

const Heading = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;

  h1 {
    margin: 0;
    color: #edf3ef;
    font-size: clamp(24px, 4vw, 36px);
    letter-spacing: -1px;
  }

  p {
    margin: 8px 0 0;
    color: #9aa79f;
    font-size: 13px;
    line-height: 1.5;
  }

  @media (max-width: 600px) {
    align-items: flex-start;
    flex-direction: column;
  }
`

const RefreshButton = styled.button`
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid #435346;
  border-radius: 7px;
  background: #17211b;
  color: #edf3ef;
  font-size: 12px;
  font-weight: 700;

  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }
`

const DateFilters = styled.div`
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
`

const DateField = styled.label`
  display: grid;
  gap: 6px;
  color: #a6b1a9;
  font-size: 11px;
  font-weight: 700;
`

const DateInput = styled.input`
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid #435346;
  border-radius: 7px;
  background: #111915;
  color: #edf3ef;
  color-scheme: dark;
`

const Totals = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 20px 0;
`

const TotalCard = styled.div`
  display: grid;
  gap: 7px;
  padding: 14px;
  border: 1px solid #26332c;
  border-radius: 9px;
  background: #151d18;

  span {
    color: #9aa79f;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.7px;
    text-transform: uppercase;
  }

  strong {
    color: #c8f169;
    font-size: clamp(16px, 3vw, 22px);
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
`

const RatingBadge = styled.span`
  display: inline-flex;
  margin-left: 8px;
  padding: 3px 7px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;

  &[data-tone='light-green'] {
    border-color: #638b3c;
    background: rgb(184 233 134 / 12%);
    color: #b8e986;
  }

  &[data-tone='green'] {
    border-color: #398552;
    background: rgb(101 217 135 / 12%);
    color: #65d987;
  }

  &[data-tone='yellow'] {
    border-color: #9c7d27;
    background: rgb(244 211 94 / 12%);
    color: #f4d35e;
  }

  &[data-tone='light-red'] {
    border-color: #a95858;
    background: rgb(255 155 155 / 12%);
    color: #ff9b9b;
  }

  &[data-tone='red'] {
    border-color: #a83d3d;
    background: rgb(255 82 82 / 12%);
    color: #ff5252;
  }
`

const Status = styled.p`
  margin: 16px 0;
  color: #a6b1a9;
  font-size: 13px;
`

const ErrorStatus = styled(Status)`
  color: #ff9a8f;
`

const TableFrame = styled.div`
  overflow: auto;
  border: 1px solid #26332c;
  border-radius: 10px;
  background: #111915;
`

const DataTable = styled.table`
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  text-align: left;

  th,
  td {
    padding: 12px 14px;
    border-bottom: 1px solid #26332c;
    vertical-align: top;
  }

  th {
    position: sticky;
    top: 0;
    background: #17211b;
    color: #c8f169;
    font-size: 10px;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  td {
    max-width: 380px;
    color: #d7dfd9;
    font-size: 12px;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  tr:last-child td {
    border-bottom: 0;
  }

  @media (max-width: 600px) {
    display: block;
    min-width: 0;

    thead {
      display: none;
    }

    tbody {
      display: block;
    }

    tr {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      border-bottom: 1px solid #26332c;
    }

    td {
      min-width: 0;
      max-width: none;
      padding: 11px 8px;
      border-bottom: 0;
      font-size: 11px;
    }

    td::before {
      display: block;
      margin-bottom: 5px;
      color: #9aa79f;
      content: attr(data-label);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
  }
`

function formatAmount(value) {
  const amount = Number(value)
  return value === null || value === undefined || value === '' || !Number.isFinite(amount)
    ? '—'
    : `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function getDate(value) {
  if (!value) return null
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatTime(value) {
  return getDate(value)?.toLocaleString() || '—'
}

function getLocalDateInputValue(value) {
  const date = getDate(value)
  if (!date) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getTodayDateInputValue() {
  return getLocalDateInputValue(new Date())
}

function getUserName(record) {
  return record.userName
    || record.playerName
    || PLAYER_IDS.find((player) => player.playerId === record.playerId)?.playerName
    || record.playerId
    || '—'
}

function getPlayedGames(record) {
  const games = Array.isArray(record.games)
    ? record.games.map((game) => game.gameName || game.gameType).filter(Boolean)
    : []
  return games.length > 0 ? games.join('\n') : '—'
}

function getWithdrawnAmount(record) {
  return record.withdrawnAmount
    ?? record.withdrawalAmount
    ?? record.withdrawedAmount
    ?? record.withdrawn_amount
}

function getWithdrawalRating(record) {
  const withdrawnAmount = getWithdrawnAmount(record)
  const depositedAmount = record.depositAmount
  if (withdrawnAmount === null || withdrawnAmount === undefined || withdrawnAmount === ''
    || depositedAmount === null || depositedAmount === undefined || depositedAmount === '') {
    return null
  }

  const difference = Number(withdrawnAmount) - Number(depositedAmount)
  if (!Number.isFinite(difference)) return null
  if (difference < 0) return { label: 'Akward', tone: 'red' }
  if (difference < 250) return { label: 'Bad', tone: 'light-red' }
  if (difference < 500) return { label: 'Not Bad', tone: 'yellow' }
  if (difference < 1000) return { label: 'Good', tone: 'light-green' }
  return { label: 'Perfect', tone: 'green' }
}

function sumAmounts(records, getAmount) {
  return records.reduce((total, record) => {
    const value = getAmount(record)
    if (value === null || value === undefined || value === '') return total

    const amount = Number(value)
    return Number.isFinite(amount) ? total + amount : total
  }, 0)
}

function getReadErrorMessage(error) {
  if (error?.code === 'permission-denied') {
    return 'Firestore denied this read. Check that the owner-scoped Firestore rules are published.'
  }
  if (error?.code === 'auth/user-mismatch') {
    return 'Your Firebase sign-in changed. Reload the page and try again.'
  }
  return 'Could not retrieve saved session data. Check your connection and Firebase setup, then try again.'
}

export function SessionDataPage({ user }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [fromDate, setFromDate] = useState(getTodayDateInputValue)
  const [toDate, setToDate] = useState(getTodayDateInputValue)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    getSessionRecords(user.uid)
      .then((savedRecords) => {
        if (active) setRecords(savedRecords)
      })
      .catch((readError) => {
        console.error('Firestore session records could not be loaded.', readError)
        if (active) setError(getReadErrorMessage(readError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user.uid, refreshVersion])

  const invalidDateRange = Boolean(fromDate && toDate && fromDate > toDate)
  const filteredRecords = invalidDateRange
    ? []
    : records.filter((record) => {
      if (!fromDate && !toDate) return true
      const recordDate = getLocalDateInputValue(record.createdAt)
      return recordDate
        && (!fromDate || recordDate >= fromDate)
        && (!toDate || recordDate <= toDate)
    })
  const totalDeposited = sumAmounts(filteredRecords, (record) => record.depositAmount)
  const totalWithdrawn = sumAmounts(filteredRecords, getWithdrawnAmount)

  return (
    <Page>
      <Topbar>
        <strong>gatekeeper</strong>
        <Navigation aria-label="Main navigation">
          <a href="#top">Check-in</a>
          <a href="#/data" aria-current="page">Transfer history</a>
        </Navigation>
      </Topbar>

      <Content>
        <Heading>
          <div>
            <h1>Transfer history</h1>
            <p>Session records saved to the signed-in account: {user.email || user.uid}</p>
          </div>
          <RefreshButton
            type="button"
            onClick={() => setRefreshVersion((version) => version + 1)}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </RefreshButton>
        </Heading>

        <DateFilters aria-label="Filter transfer history by date">
          <DateField>
            From
            <DateInput
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.currentTarget.value)}
              aria-label="From date"
            />
          </DateField>
          <DateField>
            To
            <DateInput
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.currentTarget.value)}
              aria-label="To date"
            />
          </DateField>
          <RefreshButton
            type="button"
            onClick={() => {
              setFromDate('')
              setToDate('')
            }}
            disabled={!fromDate && !toDate}
          >
            Clear dates
          </RefreshButton>
        </DateFilters>

        {!loading && !error && !invalidDateRange && (
          <Totals aria-label="Totals for selected dates">
            <TotalCard>
              <span>Total deposited</span>
              <strong>{formatAmount(totalDeposited)}</strong>
            </TotalCard>
            <TotalCard>
              <span>Total withdrawn</span>
              <strong>{formatAmount(totalWithdrawn)}</strong>
            </TotalCard>
          </Totals>
        )}

        {loading && <Status role="status">Loading saved session records…</Status>}
        {error && <ErrorStatus role="alert">{error}</ErrorStatus>}
        {invalidDateRange && <ErrorStatus role="alert">The end date must be on or after the start date.</ErrorStatus>}
        {!loading && !error && records.length === 0 && (
          <Status>No session records have been saved to this account yet.</Status>
        )}
        {!loading && !error && !invalidDateRange && records.length > 0 && filteredRecords.length === 0 && (
          <Status>No sessions found for the selected dates.</Status>
        )}
        {!loading && !error && !invalidDateRange && filteredRecords.length > 0 && (
          <>
            <Status role="status">
              {filteredRecords.length === records.length
                ? `${records.length} saved session${records.length === 1 ? '' : 's'}`
                : `${filteredRecords.length} of ${records.length} saved sessions`}
            </Status>
            <TableFrame>
              <DataTable>
                <thead>
                  <tr>
                    <th>User name</th>
                    <th>Session count</th>
                    <th>Time</th>
                    <th>Deposited amount</th>
                    <th>Played games</th>
                    <th>Withdrawn amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => {
                    const rating = getWithdrawalRating(record)
                    return (
                      <tr key={record.sessionId}>
                        <td data-label="User name">{getUserName(record)}</td>
                        <td data-label="Session count">{record.sessionNumber ?? '—'}</td>
                        <td data-label="Time">{formatTime(record.createdAt)}</td>
                        <td data-label="Deposited">{formatAmount(record.depositAmount)}</td>
                        <td data-label="Played games">{getPlayedGames(record)}</td>
                        <td data-label="Withdrawn">
                          {formatAmount(getWithdrawnAmount(record))}
                          {rating && <RatingBadge data-tone={rating.tone}>{rating.label}</RatingBadge>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </DataTable>
            </TableFrame>
          </>
        )}
      </Content>
    </Page>
  )
}
