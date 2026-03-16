export interface Book {
  id: number
  title: string
  author: string
  category: string
  price: number
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:5001'

export async function getBooks(
  pageNumber: number,
  pageSize: number,
): Promise<PagedResult<Book>> {
  const url = new URL('/api/books', API_BASE_URL)
  url.searchParams.set('pageNumber', String(pageNumber))
  url.searchParams.set('pageSize', String(pageSize))

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Failed to load books: ${response.statusText}`)
  }

  const data = (await response.json()) as PagedResult<Book>
  return data
}

