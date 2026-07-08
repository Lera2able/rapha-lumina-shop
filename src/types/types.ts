export type CollectionType = 'enlightened' | 'teacher'
export type SizeInventory = Record<string, number>

export type OrderStatus =
  | 'pending'
  | 'completed'
  | 'refund_requested'
  | 'refunded'
  | 'cancelled'

export interface Product {
  id: string
  name: string
  description: string
  collection: CollectionType
  category: string
  price: number
  cost_price: number | null
  sale_enabled: boolean
  sale_price: number | null
  sale_start_date: string | null
  sale_end_date: string | null
  image_url: string
  additional_images: string[]
  video_url: string | null
  sizes: string[]
  size_inventory: SizeInventory
  stock: number
  featured: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string | null
  phone: string | null
  role: 'user' | 'admin'
  first_name: string | null
  last_name: string | null
  created_at: string
  updated_at: string
}

export interface CartItemLocal {
  product_id: string
  quantity: number
  size: string | null
  product: Product
}

export interface ShippingAddress {
  name: string
  email: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
}

export interface OrderItem {
  name: string
  price: number
  quantity: number
  image_url: string
  product_id: string
  size: string
}

export interface Order {
  id: string
  user_id: string | null
  customer_email: string | null
  customer_name: string | null
  status: OrderStatus
  items: OrderItem[]
  total_amount: number
  shipping_cost: number
  shipping_address: ShippingAddress | null
  paystack_reference: string | null
  payment_method: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface StockNotification {
  id: string
  product_id: string
  customer_email: string
  notified: boolean
  created_at: string
  notified_at: string | null
}

export interface NewsletterSubscriber {
  id: string
  email: string
  subscribed_at: string
}
