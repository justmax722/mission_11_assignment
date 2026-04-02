export interface Book {
  id: number
  title: string
  author: string
  category: string
  price: number
}

export interface BookDetails {
  id: number
  title: string
  author: string
  publisher: string
  isbn: string
  classification: string
  category: string
  pageCount: number
  price: number
}

export type BookUpsertInput = Omit<BookDetails, 'id'>

interface BookApiModel {
  id?: number
  bookID?: number
  title: string
  author: string
  category: string
  price: number
}

interface BookDetailsApiModel {
  id?: number
  bookID?: number
  title: string
  author: string
  publisher: string
  isbn?: string
  // Backend entity is `ISBN`, which serializes as `iSBN` with the default camelCasing policy.
  iSBN?: string
  classification: string
  category: string
  pageCount: number
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
  'https://mission-13-v4-bkgtcbhtekgzg3hf.australiasoutheast-01.azurewebsites.net'

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

function mapBookDetails(apiModel: BookDetailsApiModel): BookDetails {
  return {
    id: apiModel.id ?? apiModel.bookID ?? 0,
    title: apiModel.title,
    author: apiModel.author,
    publisher: apiModel.publisher,
    isbn: apiModel.isbn ?? apiModel.iSBN ?? '',
    classification: apiModel.classification,
    category: apiModel.category,
    pageCount: apiModel.pageCount,
    price: apiModel.price,
  }
}

export async function getAllBooks(): Promise<BookDetails[]> {
  const url = new URL('/api/books/all', API_BASE_URL)
  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Failed to load books: ${response.statusText}`)
  }

  const data = (await response.json()) as BookDetailsApiModel[]
  return data.map(mapBookDetails)
}

export async function createBook(input: BookUpsertInput): Promise<BookDetails> {
  const url = new URL('/api/books', API_BASE_URL)

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`Failed to create book: ${response.statusText}`)
  }

  const data = (await response.json()) as BookDetailsApiModel
  return mapBookDetails(data)
}

export async function updateBook(
  id: number,
  input: BookUpsertInput,
): Promise<BookDetails> {
  const url = new URL(`/api/books/${id}`, API_BASE_URL)

  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`Failed to update book: ${response.statusText}`)
  }

  const data = (await response.json()) as BookDetailsApiModel
  return mapBookDetails(data)
}

export async function deleteBook(id: number): Promise<void> {
  const url = new URL(`/api/books/${id}`, API_BASE_URL)

  const response = await fetch(url.toString(), {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete book: ${response.statusText}`)
  }
}

