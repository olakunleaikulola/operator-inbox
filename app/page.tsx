"use client"

import { useEffect, useMemo, useState } from "react"

type Category = "marketing" | "product" | "research" | "learning"
type Status = "inbox" | "active" | "paused" | "done"
type StatusFilter = "all" | Status

type InboxItem = {
  id: number
  title: string
  category: Category
  status: Status
}

const STORAGE_KEY = "operator-inbox-items"

const defaultItems: InboxItem[] = [
  {
    id: 1,
    title: "Audit personal website ideas",
    category: "product",
    status: "active",
  },
  {
    id: 2,
    title: "Outline SEO tool concepts",
    category: "marketing",
    status: "inbox",
  },
  {
    id: 3,
    title: "Review AI workflow patterns",
    category: "research",
    status: "paused",
  },
]

export default function HomePage() {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<Category>("marketing")
  const [status, setStatus] = useState<Status>("inbox")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [items, setItems] = useState<InboxItem[]>([])
  const [hasLoadedItems, setHasLoadedItems] = useState(false)

  useEffect(() => {
    const savedItems = window.localStorage.getItem(STORAGE_KEY)

    if (!savedItems) {
      setItems(defaultItems)
      setHasLoadedItems(true)
      return
    }

    try {
      const parsedItems = JSON.parse(savedItems) as InboxItem[]
      setItems(parsedItems)
    } catch {
      setItems(defaultItems)
    }

    setHasLoadedItems(true)
  }, [])

  useEffect(() => {
    if (!hasLoadedItems) return

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hasLoadedItems])

  function handleAddItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) return

    const newItem: InboxItem = {
      id: Date.now(),
      title: trimmedTitle,
      category,
      status,
    }

    setItems((currentItems) => [newItem, ...currentItems])
    setTitle("")
    setCategory("marketing")
    setStatus("inbox")
  }

  function handleDeleteItem(id: number) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    )
  }

  function handleStatusChange(id: number, nextStatus: Status) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    )
  }

  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return items
    return items.filter((item) => item.status === statusFilter)
  }, [items, statusFilter])

  return (
    <main className="page">
      <div className="container">
        <header className="header">
          <h1>Operator Inbox</h1>
          <p>
            A lightweight workflow inbox for marketers, product builders, and
            solo operators.
          </p>
        </header>

        <section className="panel">
          <h2>Add item</h2>

          <form onSubmit={handleAddItem} className="form">
            <div className="field">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                placeholder="Enter a task or idea"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                <option value="marketing">Marketing</option>
                <option value="product">Product</option>
                <option value="research">Research</option>
                <option value="learning">Learning</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <option value="inbox">Inbox</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="done">Done</option>
              </select>
            </div>

            <button type="submit">Add item</button>
          </form>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>Items</h2>

            <div className="filterGroup">
              <label htmlFor="statusFilter">Filter by status</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
              >
                <option value="all">All</option>
                <option value="inbox">Inbox</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="itemList">
            {!hasLoadedItems ? (
              <p>Loading items...</p>
            ) : filteredItems.length === 0 ? (
              <p>No items found for this filter.</p>
            ) : (
              filteredItems.map((item) => (
                <article key={item.id} className="itemCard">
                  <h3>{item.title}</h3>
                  <p>
                    <strong>Category:</strong> {item.category}
                  </p>

                  <div className="statusRow">
                    <label htmlFor={`status-${item.id}`}>
                      <strong>Status:</strong>
                    </label>
                    <select
                      id={`status-${item.id}`}
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value as Status)
                      }
                    >
                      <option value="inbox">Inbox</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="deleteButton"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Delete
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}