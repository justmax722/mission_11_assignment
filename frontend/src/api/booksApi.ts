export interface Book {
  id: number
  title: string
  author: string
  category: string
  price: number
}

interface BookApiModel {
  id?: number
  bookID?: number
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
  category?: string,
): Promise<PagedResult<Book>> {
  const url = new URL('/api/books', API_BASE_URL)
  url.searchParams.set('pageNumber', String(pageNumber))
  url.searchParams.set('pageSize', String(pageSize))
  if (category && category !== 'All') {
    url.searchParams.set('category', category)
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Failed to load books: ${response.statusText}`)
  }

  const data = (await response.json()) as PagedResult<BookApiModel>

  return {
    ...data,
    items: data.items.map((book) => ({
      id: book.id ?? book.bookID ?? 0,
      title: book.title,
      author: book.author,
      category: book.category,
      price: book.price,
    })),
  }
}

export async function getCategories(): Promise<string[]> {
  const url = new URL('/api/books/categories', API_BASE_URL)
  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Failed to load categories: ${response.statusText}`)
  }

  return (await response.json()) as string[]
}

