import ttb from './assets/banks/TTB.png'
import kbank from './assets/banks/KBANK.png'
import scb from './assets/banks/SCB.png'
import bbl from './assets/banks/BBL.png'
import ktb from './assets/banks/KTB.png'

// value = stored NocoDB choice; label = shown in the dropdown; logo = bank mark
export const BANKS = [
  { value: 'TTB', label: 'TTB', logo: ttb },
  { value: 'KBank', label: 'KBank', logo: kbank },
  { value: 'SCB', label: 'SCB', logo: scb },
  { value: 'BBL', label: 'BBL', logo: bbl },
  { value: 'KTB', label: 'KTB', logo: ktb },
]

const byValue = Object.fromEntries(BANKS.map((bank) => [bank.value, bank]))
export const bankLogo = (value) => (byValue[value] && byValue[value].logo) || ''
