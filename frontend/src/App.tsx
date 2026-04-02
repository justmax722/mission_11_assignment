import { Badge, Container, Nav, Navbar } from 'react-bootstrap'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import BooksPage from './pages/BooksPage'
import CartPage from './pages/CartPage'
import AdminBooksPage from './pages/AdminBooksPage'
import { useCart } from './context/CartContext'

function App() {
  const { itemCount } = useCart()

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="sm" className="mb-4">
        <Container>
          <Navbar.Brand as={NavLink} to="/books">
            Mission 11 Books
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/books">
              Books
            </Nav.Link>
            <Nav.Link as={NavLink} to="/admin/books">
              Admin Books
            </Nav.Link>
            <Nav.Link as={NavLink} to="/cart">
              Cart{' '}
              {/* TA NOTE: New Bootstrap feature #2 (not covered in videos): Badge component for live cart count */}
              <Badge bg="info" text="dark">
                {itemCount}
              </Badge>
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <Container className="mb-4">
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/admin/books" element={<AdminBooksPage />} />
          <Route path="/adminbooks" element={<AdminBooksPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
