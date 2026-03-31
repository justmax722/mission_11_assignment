import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Table,
  Toast,
  ToastContainer,
} from 'react-bootstrap'
import { Link, useSearchParams } from 'react-router-dom'
import { type Book, getBooks, getCategories } from '../api/booksApi'
import { useCart } from '../context/CartContext'

const PAGE_SIZE_OPTIONS = [5, 10, 20]

function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [pageNumber, setPageNumber] = useState(
    Number(searchParams.get('pageNumber') ?? '1'),
  )
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get('pageSize') ?? '5'),
  )
  const [category, setCategory] = useState(searchParams.get('category') ?? 'All')
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortAscending, setSortAscending] = useState(true)
  const [showAddedToast, setShowAddedToast] = useState(false)
  const [addedTitle, setAddedTitle] = useState('')
  const { addBook, itemCount, subtotal, setLastBooksState } = useCart()

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('pageNumber', String(pageNumber))
      next.set('pageSize', String(pageSize))
      if (category !== 'All') {
        next.set('category', category)
      } else {
        next.delete('category')
      }
      return next
    })
  }, [category, pageNumber, pageSize, setSearchParams])

  useEffect(() => {
    let isCancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getBooks(pageNumber, pageSize, category)
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
  }, [pageNumber, pageSize, category])

  useEffect(() => {
    let isCancelled = false

    async function loadCategories() {
      try {
        const result = await getCategories()
        if (!isCancelled) {
          setCategories(result)
        }
      } catch {
        // Keep UI usable even if categories fail.
      }
    }

    loadCategories()
    return () => {
      isCancelled = true
    }
  }, [])

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

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(event.target.value)
    setPageNumber(1)
  }

  const handleTitleHeaderClick = () => {
    setSortAscending((prev) => !prev)
  }

  const sortedBooks = useMemo(
    () =>
      [...books].sort((a, b) => {
        const titleA = a.title.toLocaleLowerCase()
        const titleB = b.title.toLocaleLowerCase()
        if (titleA < titleB) return sortAscending ? -1 : 1
        if (titleA > titleB) return sortAscending ? 1 : -1
        return 0
      }),
    [books, sortAscending],
  )

  const handleAddToCart = (book: Book) => {
    addBook(book)
    setLastBooksState({ pageNumber, pageSize, category })
    setAddedTitle(book.title)
    setShowAddedToast(true)
  }

  return (
    <Row className="g-4">
      <Col lg={8}>
        <Row className="mb-3 align-items-center">
          <Col>
            <h1 className="h3 mb-0">Books</h1>
            <div className="text-muted">
              Showing page {pageNumber} of {totalPages} ({totalCount} total books)
            </div>
          </Col>
          <Col xs={12} md="auto" className="d-flex align-items-center gap-2">
            <Form.Label className="mb-0" htmlFor="categorySelect">
              Category
            </Form.Label>
            <Form.Select
              id="categorySelect"
              size="sm"
              value={category}
              onChange={handleCategoryChange}
              style={{ width: 'auto' }}
            >
              <option value="All">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={12} md="auto" className="d-flex align-items-center gap-2">
            <Form.Label className="mb-0" htmlFor="pageSizeSelect">
              Results per page
            </Form.Label>
            <Form.Select
              id="pageSizeSelect"
              size="sm"
              value={pageSize}
              onChange={handlePageSizeChange}
              style={{ width: 'auto' }}
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
                <th className="text-end">Cart</th>
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
                  <td className="text-end">
                    <Button size="sm" onClick={() => handleAddToCart(book)}>
                      Add to Cart
                    </Button>
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
      </Col>

      <Col lg={4}>
        <Card>
          <Card.Body>
            <Card.Title>Cart Summary</Card.Title>
            <div className="d-flex justify-content-between">
              <span>Items</span>
              <strong>{itemCount}</strong>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span>Total</span>
              <strong>
                {subtotal.toLocaleString(undefined, {
                  style: 'currency',
                  currency: 'USD',
                })}
              </strong>
            </div>
            <Link to="/cart" className="btn btn-outline-primary w-100">
              View Cart
            </Link>
          </Card.Body>
        </Card>
      </Col>

      {/* TA NOTE: New Bootstrap feature #1 (not covered in videos): Toast component for add-to-cart feedback */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          onClose={() => setShowAddedToast(false)}
          show={showAddedToast}
          autohide
          delay={1800}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Cart Updated</strong>
          </Toast.Header>
          <Toast.Body>{addedTitle} added to cart.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Row>
  )
}

export default BooksPage

