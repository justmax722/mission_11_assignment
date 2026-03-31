import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap'
import {
  createBook,
  deleteBook,
  getAllBooks,
  updateBook,
  type BookDetails,
  type BookUpsertInput,
} from '../api/booksApi'

const EMPTY_BOOK_INPUT: BookUpsertInput = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
}

function isNonEmpty(s: string) {
  return s.trim().length > 0
}

function isValidInput(input: BookUpsertInput) {
  return (
    isNonEmpty(input.title) &&
    isNonEmpty(input.author) &&
    isNonEmpty(input.publisher) &&
    isNonEmpty(input.isbn) &&
    isNonEmpty(input.classification) &&
    isNonEmpty(input.category) &&
    input.pageCount > 0 &&
    input.price >= 0
  )
}

function AdminBooksPage() {
  const [books, setBooks] = useState<BookDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createInput, setCreateInput] = useState<BookUpsertInput>(EMPTY_BOOK_INPUT)

  const [editingBookId, setEditingBookId] = useState<number | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editInput, setEditInput] = useState<BookUpsertInput>(EMPTY_BOOK_INPUT)

  const reloadBooks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAllBooks()
      setBooks(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load books')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void reloadBooks()
  }, [])

  const resetCreateForm = () => {
    setCreateInput(EMPTY_BOOK_INPUT)
  }

  const resetEditForm = () => {
    setEditingBookId(null)
    setEditInput(EMPTY_BOOK_INPUT)
  }

  const openEdit = (book: BookDetails) => {
    setEditingBookId(book.id)
    setEditInput({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn,
      classification: book.classification,
      category: book.category,
      pageCount: book.pageCount,
      price: book.price,
    })
    setShowEditModal(true)
  }

  const handleCreateSubmit = async () => {
    if (!isValidInput(createInput)) return

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await createBook(createInput)
      setSuccessMessage('Book created successfully.')
      setShowCreateModal(false)
      resetCreateForm()
      await reloadBooks()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create book')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSubmit = async () => {
    if (editingBookId == null) return
    if (!isValidInput(editInput)) return

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await updateBook(editingBookId, editInput)
      setSuccessMessage('Book updated successfully.')
      setShowEditModal(false)
      resetEditForm()
      await reloadBooks()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update book')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (book: BookDetails) => {
    const confirmed = window.confirm(`Delete "${book.title}"?`)
    if (!confirmed) return

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await deleteBook(book.id)
      setSuccessMessage('Book deleted successfully.')
      await reloadBooks()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete book')
    } finally {
      setIsLoading(false)
    }
  }

  const sortedBooks = useMemo(() => {
    // API already returns ordered by BookID, but keep stable ordering in UI.
    return [...books].sort((a, b) => a.id - b.id)
  }, [books])

  const classificationOptions = useMemo(
    () =>
      [...new Set(books.map((b) => b.classification).filter((c) => c.trim().length > 0))]
        .sort((a, b) => a.localeCompare(b)),
    [books],
  )

  const categoryOptions = useMemo(
    () => [...new Set(books.map((b) => b.category).filter((c) => c.trim().length > 0))].sort(),
    [books],
  )

  return (
    <Row className="g-4">
      <Col lg={12}>
        <h1 className="h3 mb-3">Admin Books</h1>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert
            variant="success"
            className="mb-3"
            onClose={() => setSuccessMessage(null)}
            dismissible
          >
            {successMessage}
          </Alert>
        )}

        <Card className="mb-3">
          <Card.Body className="d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted">Total books: {books.length}</div>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>Create Book</Button>
          </Card.Body>
        </Card>

        <div className="table-responsive">
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Publisher</th>
                <th>ISBN</th>
                <th>Classification</th>
                <th>Category</th>
                <th className="text-end">Page Count</th>
                <th className="text-end">Price</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedBooks.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.publisher}</td>
                  <td>{book.isbn}</td>
                  <td>{book.classification}</td>
                  <td>{book.category}</td>
                  <td className="text-end">{book.pageCount}</td>
                  <td className="text-end">
                    {book.price.toLocaleString(undefined, {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => openEdit(book)}
                        disabled={isLoading}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => void handleDelete(book)}
                        disabled={isLoading}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!sortedBooks.length && !isLoading && (
                <tr>
                  <td colSpan={9} className="text-center">
                    No books found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {isLoading && (
          <div className="text-center mt-3">
            <Spinner animation="border" />
          </div>
        )}
      </Col>

      <Modal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false)
          resetCreateForm()
        }}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={createInput.title}
                onChange={(e) =>
                  setCreateInput((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Author</Form.Label>
              <Form.Control
                value={createInput.author}
                onChange={(e) =>
                  setCreateInput((prev) => ({ ...prev, author: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Publisher</Form.Label>
              <Form.Control
                value={createInput.publisher}
                onChange={(e) =>
                  setCreateInput((prev) => ({
                    ...prev,
                    publisher: e.target.value,
                  }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>ISBN</Form.Label>
              <Form.Control
                value={createInput.isbn}
                onChange={(e) =>
                  setCreateInput((prev) => ({ ...prev, isbn: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Classification</Form.Label>
              <Form.Select
                value={createInput.classification}
                onChange={(e) =>
                  setCreateInput((prev) => ({
                    ...prev,
                    classification: e.target.value,
                  }))
                }
              >
                <option value="">Select classification</option>
                {classificationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={createInput.category}
                onChange={(e) =>
                  setCreateInput((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              >
                <option value="">Select category</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Page Count</Form.Label>
              <Form.Control
                type="number"
                value={createInput.pageCount}
                min={0}
                onChange={(e) =>
                  setCreateInput((prev) => ({
                    ...prev,
                    pageCount: Number(e.target.value),
                  }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-0">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={createInput.price}
                min={0}
                onChange={(e) =>
                  setCreateInput((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowCreateModal(false)
              resetCreateForm()
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleCreateSubmit()}
            disabled={isLoading || !isValidInput(createInput)}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false)
          resetEditForm()
        }}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={editInput.title}
                onChange={(e) =>
                  setEditInput((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Author</Form.Label>
              <Form.Control
                value={editInput.author}
                onChange={(e) =>
                  setEditInput((prev) => ({ ...prev, author: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Publisher</Form.Label>
              <Form.Control
                value={editInput.publisher}
                onChange={(e) =>
                  setEditInput((prev) => ({
                    ...prev,
                    publisher: e.target.value,
                  }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>ISBN</Form.Label>
              <Form.Control
                value={editInput.isbn}
                onChange={(e) =>
                  setEditInput((prev) => ({ ...prev, isbn: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Classification</Form.Label>
              <Form.Select
                value={editInput.classification}
                onChange={(e) =>
                  setEditInput((prev) => ({
                    ...prev,
                    classification: e.target.value,
                  }))
                }
              >
                <option value="">Select classification</option>
                {classificationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={editInput.category}
                onChange={(e) =>
                  setEditInput((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              >
                <option value="">Select category</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Page Count</Form.Label>
              <Form.Control
                type="number"
                value={editInput.pageCount}
                min={0}
                onChange={(e) =>
                  setEditInput((prev) => ({
                    ...prev,
                    pageCount: Number(e.target.value),
                  }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-0">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={editInput.price}
                min={0}
                onChange={(e) =>
                  setEditInput((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowEditModal(false)
              resetEditForm()
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleEditSubmit()}
            disabled={isLoading || !isValidInput(editInput)}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  )
}

export default AdminBooksPage

