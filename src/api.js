const API_ROOT = import.meta.env.VITE_NOCODB_API || 'https://ndb.3xbun.com/api/v3/data/pxleh7p3llnfif4'
const TOKEN = import.meta.env.VITE_NOCODB_TOKEN
const EXPENSES_TABLE = 'mmie27wczrlun1v'
const PAYMENTS_TABLE = 'menp6t74t4gek4m'

async function request(table, path = '', options = {}) {
  if (!TOKEN) throw new Error('Missing VITE_NOCODB_TOKEN')
  const response = await fetch(`${API_ROOT}/${table}/records${path}`, {
    ...options,
    headers: { accept: 'application/json', 'content-type': 'application/json', 'xc-token': TOKEN, ...options.headers },
  })
  if (!response.ok) {
    const details = await response.json().catch(() => null)
    throw new Error(details?.message ? `NocoDB request failed: ${response.status} - ${details.message}` : `NocoDB request failed: ${response.status}`)
  }
  return response.status === 204 ? null : response.json()
}

function records(data) {
  return (data.records || []).map((record) => ({ id: record.id, ...record.fields, title: record.fields.title ?? record.fields.Title }))
}

export async function listExpenses() { return records(await request(EXPENSES_TABLE, '?limit=100')) }
export async function listPayments() { return records(await request(PAYMENTS_TABLE, '?limit=100')) }
export async function createExpense(fields) { return request(EXPENSES_TABLE, '', { method: 'POST', body: JSON.stringify([{ fields }]) }) }
export async function updateExpense(id, fields) { return request(EXPENSES_TABLE, '', { method: 'PATCH', body: JSON.stringify([{ id, fields }]) }) }
export async function deleteExpense(id) { return request(EXPENSES_TABLE, '', { method: 'DELETE', body: JSON.stringify([{ id }]) }) }
export async function createPayment(fields) { return request(PAYMENTS_TABLE, '', { method: 'POST', body: JSON.stringify([{ fields }]) }) }
export async function deletePayment(id) { return request(PAYMENTS_TABLE, '', { method: 'DELETE', body: JSON.stringify([{ id }]) }) }
