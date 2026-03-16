import { useEffect, useState } from 'react'
import { Alert, Col, Form, Row, Spinner, Table } from 'react-bootstrap'
import { type Book, getBooks } from '../api/booksApi'

const PAGE_SIZE_OPTIONS = [5, 10, 20]

function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortAscending, setSortAscending] = useState(true)

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  useEffect(() => {
    let isCancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getBooks(pageNumber, pageSize)
        if (isCancelled) return
        setBooks(result.items)
        setTotalCount(result.totalCount)
      } catch (err) {
        if (isCancelled) return
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred',
        )
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isCancelled = true
    }
  }, [pageNumber, pageSize])

  const handlePrevious = () => {
    setPageNumber((prev) => Math.max(1, prev - 1))
  }

  const handleNext = () => {
    setPageNumber((prev) => Math.min(totalPages, prev + 1))
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(event.target.value)
    setPageSize(newSize)
    setPageNumber(1)
  }

  const handleTitleHeaderClick = () => {
    setSortAscending((prev) => !prev)
  }

  const sortedBooks = [...books].sort((a, b) => {
    const titleA = a.title.toLocaleLowerCase()
    const titleB = b.title.toLocaleLowerCase()
    if (titleA < titleB) return sortAscending ? -1 : 1
    if (titleA > titleB) return sortAscending ? 1 : -1
    return 0
  })

  return (
    <>
      <Row className="mb-3 align-items-center">
        <Col>
          <h1 className="h3 mb-0">Books</h1>
          <div className="text-muted">
            Showing page {pageNumber} of {totalPages} (
            {totalCount} total books)
          </div>
        </Col>
        <Col xs="auto">
          <Form.Label className="me-2 mb-0" htmlFor="pageSizeSelect">
            Results per page
          </Form.Label>
          <Form.Select
            id="pageSizeSelect"
            size="sm"
            value={pageSize}
            onChange={handlePageSizeChange}
            style={{ width: 'auto', display: 'inline-block' }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <div className="table-responsive mb-3">
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th
                style={{ cursor: 'pointer' }}
                onClick={handleTitleHeaderClick}
              >
                Title {sortAscending ? '▲' : '▼'}
              </th>
              <th>Author</th>
              <th>Category</th>
              <th className="text-end">Price</th>
            </tr>
          </thead>
          <tbody>
            {sortedBooks.map((book, index) => (
              <tr key={book.id ?? index}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td className="text-end">
                  {book.price.toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </td>
              </tr>
            ))}
            {books.length === 0 && !isLoading && (
              <tr key="no-books">
                <td colSpan={5} className="text-center">
                  No books found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <Row className="align-items-center">
        <Col>
          <div className="text-muted">
            {books.length > 0 &&
              `Showing ${books.length} of ${totalCount} books on this page.`}
          </div>
        </Col>
        <Col xs="auto">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handlePrevious}
              disabled={pageNumber <= 1 || isLoading}
            >
              Previous
            </button>
            <span>
              Page {pageNumber} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleNext}
              disabled={pageNumber >= totalPages || isLoading}
            >
              Next
            </button>
            {isLoading && <Spinner animation="border" size="sm" />}
          </div>
        </Col>
      </Row>
    </>
  )
}

export default BooksPage

