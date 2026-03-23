import { Button, Card, Col, Row, Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function CartPage() {
  const navigate = useNavigate()
  const {
    items,
    subtotal,
    total,
    increment,
    decrement,
    remove,
    clear,
    lastBooksState,
  } = useCart()

  const continueShopping = () => {
    if (lastBooksState) {
      const params = new URLSearchParams({
        pageNumber: String(lastBooksState.pageNumber),
        pageSize: String(lastBooksState.pageSize),
      })
      if (lastBooksState.category && lastBooksState.category !== 'All') {
        params.set('category', lastBooksState.category)
      }
      navigate(`/books?${params.toString()}`)
      return
    }

    navigate('/books')
  }

  return (
    <Row className="g-4">
      <Col lg={8}>
        <h1 className="h3 mb-3">Shopping Cart</h1>
        <div className="table-responsive">
          <Table bordered hover>
            <thead>
              <tr>
                <th>Title</th>
                <th className="text-center">Quantity</th>
                <th className="text-end">Price</th>
                <th className="text-end">Subtotal</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td className="text-center">
                    <div className="d-inline-flex align-items-center gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => decrement(item.id)}
                      >
                        -
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => increment(item.id)}
                      >
                        +
                      </Button>
                    </div>
                  </td>
                  <td className="text-end">
                    {item.price.toLocaleString(undefined, {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </td>
                  <td className="text-end">
                    {(item.price * item.quantity).toLocaleString(undefined, {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </td>
                  <td className="text-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => remove(item.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center">
                    Your cart is empty.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Col>

      <Col lg={4}>
        <Card>
          <Card.Body>
            <Card.Title>Order Summary</Card.Title>
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal</span>
              <strong>
                {subtotal.toLocaleString(undefined, {
                  style: 'currency',
                  currency: 'USD',
                })}
              </strong>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span>Total</span>
              <strong>
                {total.toLocaleString(undefined, {
                  style: 'currency',
                  currency: 'USD',
                })}
              </strong>
            </div>
            <div className="d-grid gap-2">
              <Button variant="primary" onClick={continueShopping}>
                Continue Shopping
              </Button>
              <Button variant="outline-danger" onClick={clear} disabled={!items.length}>
                Clear Cart
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default CartPage
