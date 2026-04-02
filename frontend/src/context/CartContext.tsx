import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { Book } from '../api/booksApi'

const STORAGE_KEY = 'mission11.cart'
const LAST_BOOKS_STATE_KEY = 'mission11.lastBooksState'

export interface CartItem {
  id: number
  title: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Pick<CartItem, 'id' | 'title' | 'price'> }
  | { type: 'INCREMENT'; payload: { id: number } }
  | { type: 'DECREMENT'; payload: { id: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'CLEAR' }

const initialState: CartState = { items: [] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((item) => item.id === action.payload.id)
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }
      }

      return {
        items: [...state.items, { ...action.payload, quantity: 1 }],
      }
    }
    case 'INCREMENT':
      return {
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      }
    case 'DECREMENT':
      return {
        items: state.items
          .map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          )
          .filter((item) => item.quantity > 0),
      }
    case 'REMOVE_ITEM':
      return {
        items: state.items.filter((item) => item.id !== action.payload.id),
      }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

function loadInitialState(): CartState {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return initialState

  try {
    const parsed = JSON.parse(raw) as CartState
    if (!Array.isArray(parsed.items)) return initialState
    return parsed
  } catch {
    return initialState
  }
}

export interface LastBooksState {
  pageNumber: number
  pageSize: number
  category: string
}

function loadLastBooksState(): LastBooksState | null {
  const raw = sessionStorage.getItem(LAST_BOOKS_STATE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as LastBooksState
  } catch {
    return null
  }
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  total: number
  addBook: (book: Book) => void
  increment: (id: number) => void
  decrement: (id: number) => void
  remove: (id: number) => void
  clear: () => void
  lastBooksState: LastBooksState | null
  setLastBooksState: (state: LastBooksState) => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, loadInitialState)
  const [lastBooksState, setLastBooksStateState] = useReducer(
    (_: LastBooksState | null, next: LastBooksState) => next,
    null,
    loadLastBooksState,
  )

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (lastBooksState) {
      sessionStorage.setItem(LAST_BOOKS_STATE_KEY, JSON.stringify(lastBooksState))
    }
  }, [lastBooksState])

  const value = useMemo<CartContextValue>(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

    return {
      items: state.items,
      itemCount,
      subtotal,
      total: subtotal,
      addBook: (book) =>
        dispatch({
          type: 'ADD_ITEM',
          payload: { id: book.id, title: book.title, price: book.price },
        }),
      increment: (id) => dispatch({ type: 'INCREMENT', payload: { id } }),
      decrement: (id) => dispatch({ type: 'DECREMENT', payload: { id } }),
      remove: (id) => dispatch({ type: 'REMOVE_ITEM', payload: { id } }),
      clear: () => dispatch({ type: 'CLEAR' }),
      lastBooksState,
      setLastBooksState: (nextState) => setLastBooksStateState(nextState),
    }
  }, [state.items, lastBooksState])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
