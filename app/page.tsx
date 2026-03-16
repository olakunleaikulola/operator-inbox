"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../lib/supabase"

type Category = "marketing" | "product" | "research" | "learning"
type Status = "inbox" | "active" | "paused" | "done"
type StatusFilter = "all" | Status

type InboxItem = {
  id: number
  title: string
  category: Category
  status: Status
  created_at?: string
}

export default function HomePage() {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<Category>("marketing")
  const [status, setStatus] = useState<Status>("inbox")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [items, setItems] = useState<InboxItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadItems() {
      setIsLoading(true)
      setErrorMessage("")

      const { data, error } = await supabase
        .from("inbox_items")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        setErrorMessage("Failed to load items.")
        setIsLoading(false)
        return
      }

      setItems((data as InboxItem[]) ?? [])
      setIsLoading(false)
    }

    loadItems()
  }, [])

  async function handleAddItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) return

    setIsSubmitting(true)
    setErrorMessage("")

    const { data, error } = await supabase
      .from("inbox_items")
      .insert([
        {
          title: trimmedTitle,
          category,
          status,
        },
      ])
      .select()
      .single()

    if (error) {
      setErrorMessage("Failed to add item.")
      setIsSubmitting(false)
      return
    }

    setItems((currentItems) => [data as InboxItem, ...currentItems])
    setTitle("")
    setCategory("marketing")
    setStatus("inbox")
    setIsSubmitting(false)
  }

  async function handleDeleteItem(id: number) {
    setErrorMessage("")

    const previousItems = items
    setItems((currentItems) => currentItems.filter((item) => item.id !== id))

    const { error } = await supabase.from("inbox_items").delete().eq("id", id)

    if (error) {
      setItems(previousItems)
      setErrorMessage("Failed to delete item.")
    }
  }

  async function handleStatusChange(id: number, nextStatus: Status) {
    setErrorMessage("")

    const previousItems = items

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    )

    const { error } = await supabase
      .from("inbox_items")
      .update({ status: nextStatus })
      .eq("id", id)

    if (error) {
      setItems(previousItems)
      setErrorMessage("Failed to update status.")
    }
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

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add item"}
            </button>
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

          {errorMessage ? <p>{errorMessage}</p> : null}

          <div className="itemList">
            {isLoading ? (
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