import { Container, Nav, Navbar } from 'react-bootstrap'
import { Navigate, Route, Routes } from 'react-router-dom'
import BooksPage from './pages/BooksPage'

function App() {
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="sm" className="mb-4">
        <Container>
          <Navbar.Brand href="/">Mission 11 Books</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/books">Books</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <Container className="mb-4">
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<BooksPage />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
