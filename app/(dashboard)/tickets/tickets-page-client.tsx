"use client"

import { useMemo, useState } from "react"
import { Pencil, Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export interface TourOption {
  id: string
  name: string
  status: string
}

export interface TicketItem {
  id: string
  tour_id: string
  name: string
  code: string
  min_age: number | null
  max_age: number | null
  is_active: boolean
  sort_order: number
}

interface TicketsPageClientProps {
  initialTickets: TicketItem[]
  tours: TourOption[]
}

interface TicketsApiResponse {
  success: boolean
  data?: {
    items: TicketItem[]
  }
  error?: { message?: string }
}

const EMPTY_CREATE_FORM = {
  tour_id: "",
  name: "",
  code: "",
  min_age: "",
  max_age: "",
  is_active: true,
}

export default function TicketsPageClient({ initialTickets, tours }: TicketsPageClientProps) {
  const [tickets, setTickets] = useState<TicketItem[]>(initialTickets)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [tourIdFilter, setTourIdFilter] = useState<string>("all")

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM)
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    code: "",
    min_age: "",
    max_age: "",
    is_active: true,
  })

  const tourNameMap = useMemo(() => {
    const map = new Map<string, string>()
    tours.forEach((tour) => map.set(tour.id, tour.name))
    return map
  }, [tours])

  const loadTickets = async () => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("limit", "500")
    if (tourIdFilter !== "all") params.set("tour_id", tourIdFilter)

    try {
      const res = await fetch(`/api/v1/ticket-types?${params.toString()}`, { cache: "no-store" })
      const json = (await res.json()) as TicketsApiResponse
      if (!res.ok || !json.success || !json.data) {
        setError(json.error?.message ?? "Failed to load tickets")
        setTickets([])
      } else {
        setTickets(json.data.items)
      }
    } catch {
      setError("Failed to load tickets")
      setTickets([])
    }

    setLoading(false)
  }

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return tickets
    return tickets.filter((ticket) => {
      const tourName = tourNameMap.get(ticket.tour_id) ?? ""
      return (
        ticket.name.toLowerCase().includes(q) ||
        ticket.code.toLowerCase().includes(q) ||
        tourName.toLowerCase().includes(q)
      )
    })
  }, [search, tickets, tourNameMap])

  const resetCreate = () => {
    setCreateForm(EMPTY_CREATE_FORM)
    setFormError(null)
  }

  const handleCreate = async () => {
    setSaving(true)
    setFormError(null)

    const res = await fetch("/api/v1/ticket-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tour_id: createForm.tour_id,
        name: createForm.name,
        code: createForm.code.toUpperCase(),
        min_age: createForm.min_age ? Number(createForm.min_age) : null,
        max_age: createForm.max_age ? Number(createForm.max_age) : null,
        is_active: createForm.is_active,
      }),
    })

    const json = (await res.json()) as { success?: boolean; error?: { message?: string } }

    if (!res.ok || !json.success) {
      setFormError(json.error?.message ?? "Create failed")
      setSaving(false)
      return
    }

    setCreateOpen(false)
    resetCreate()
    await loadTickets()
    setSaving(false)
  }

  const openEdit = (ticket: TicketItem) => {
    setEditForm({
      id: ticket.id,
      name: ticket.name,
      code: ticket.code,
      min_age: ticket.min_age == null ? "" : String(ticket.min_age),
      max_age: ticket.max_age == null ? "" : String(ticket.max_age),
      is_active: ticket.is_active,
    })
    setFormError(null)
    setEditOpen(true)
  }

  const handleEdit = async () => {
    setSaving(true)
    setFormError(null)

    const res = await fetch(`/api/v1/ticket-types/${editForm.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        code: editForm.code.toUpperCase(),
        min_age: editForm.min_age ? Number(editForm.min_age) : null,
        max_age: editForm.max_age ? Number(editForm.max_age) : null,
        is_active: editForm.is_active,
      }),
    })

    const json = (await res.json()) as { success?: boolean; error?: { message?: string } }
    if (!res.ok || !json.success) {
      setFormError(json.error?.message ?? "Update failed")
      setSaving(false)
      return
    }

    setEditOpen(false)
    await loadTickets()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this ticket type?")
    if (!confirmed) return

    const res = await fetch(`/api/v1/ticket-types/${id}`, { method: "DELETE" })
    if (!res.ok) {
      alert("Delete failed")
      return
    }

    await loadTickets()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Tickets</h1>
          <p className="text-muted-foreground">Manage ticket types separately from tours.</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Ticket Type
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by ticket name, code, or tour"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={tourIdFilter}
              onChange={(e) => setTourIdFilter(e.target.value)}
            >
              <option value="all">All Tours</option>
              {tours.map((tour) => (
                <option key={tour.id} value={tour.id}>{tour.name}</option>
              ))}
            </select>
            <Button variant="outline" onClick={loadTickets}>Apply</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Tour</TableHead>
                <TableHead>Age Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">Loading tickets...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-destructive py-10">{error}</TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">No ticket types found</TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="font-semibold text-foreground">{ticket.name}</div>
                      <div className="text-xs text-muted-foreground">{ticket.code}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{tourNameMap.get(ticket.tour_id) ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {ticket.min_age == null && ticket.max_age == null
                        ? "-"
                        : `${ticket.min_age ?? 0} - ${ticket.max_age ?? "∞"}`}
                    </TableCell>
                    <TableCell>
                      <Badge className={ticket.is_active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-700 hover:bg-slate-100"}>
                        {ticket.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ticket)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(ticket.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Ticket Type</DialogTitle>
            <DialogDescription>Create a ticket type and attach it to a tour.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Tour</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={createForm.tour_id}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, tour_id: e.target.value }))}
              >
                <option value="">Select tour</option>
                {tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>{tour.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Adult"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Code</label>
                <Input
                  value={createForm.code}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="ADT"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Min Age</label>
                <Input
                  type="number"
                  min="0"
                  value={createForm.min_age}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, min_age: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Max Age</label>
                <Input
                  type="number"
                  min="0"
                  value={createForm.max_age}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, max_age: e.target.value }))}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={createForm.is_active}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              Active
            </label>

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreate(); }}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving..." : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ticket Type</DialogTitle>
            <DialogDescription>Update ticket type information.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Code</label>
                <Input
                  value={editForm.code}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Min Age</label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.min_age}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, min_age: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Max Age</label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.max_age}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, max_age: e.target.value }))}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editForm.is_active}
                onChange={(e) => setEditForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              Active
            </label>

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
