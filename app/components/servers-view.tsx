// app/components/servers-view.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { toast } from "@/hooks/use-toast"
import { Pencil, Trash2, Loader2 } from "lucide-react"

interface ServerConfig {
  id: number
  guild_id: string
  channel_id: string
  game_type: string
  server_ip: string
  server_port: number
  message_interval: number
}

export default function ServersView() {
  const [servers, setServers] = useState<ServerConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingServer, setEditingServer] = useState<ServerConfig | null>(null)

  const form = useForm<ServerConfig>()

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/server-config')
      if (response.ok) {
        const data = await response.json()
        setServers(data)
      } else {
        throw new Error('Failed to fetch servers')
      }
    } catch (error) {
      console.error('Error fetching servers:', error)
      toast({
        title: "Error",
        description: "Failed to load servers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (server: ServerConfig) => {
    setEditingServer(server)
    form.reset(server)
    setEditModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/server-config/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Server deleted successfully",
        })
        fetchServers()
      } else {
        throw new Error('Failed to delete server')
      }
    } catch (error) {
      console.error('Error deleting server:', error)
      toast({
        title: "Error",
        description: "Failed to delete server",
        variant: "destructive",
      })
    }
  }

  const handleEditSubmit = async (values: ServerConfig) => {
    if (!editingServer) return

    try {
      const response = await fetch(`/api/server-config/${editingServer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Server updated successfully",
        })
        setEditModalOpen(false)
        fetchServers()
      } else {
        throw new Error('Failed to update server')
      }
    } catch (error) {
      console.error('Error updating server:', error)
      toast({
        title: "Error",
        description: "Failed to update server",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container text-white mx-auto py-10">
      <h2 className="text-2xl font-bold mb-5">Server Configurations</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Guild ID</TableHead>
              <TableHead className="text-white">Channel ID</TableHead>
              <TableHead className="text-white">Game Type</TableHead>
              <TableHead className="text-white">Server IP</TableHead>
              <TableHead className="text-white">Server Port</TableHead>
              <TableHead className="text-white">Message Interval</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              servers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell>{server.guild_id}</TableCell>
                  <TableCell>{server.channel_id}</TableCell>
                  <TableCell>{server.game_type}</TableCell>
                  <TableCell>{server.server_ip}</TableCell>
                  <TableCell>{server.server_port}</TableCell>
                  <TableCell>{server.message_interval}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(server)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(server.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Server Configuration</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="channel_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="game_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Type</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="server_ip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Server IP</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="server_port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Server Port</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message_interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Interval</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}