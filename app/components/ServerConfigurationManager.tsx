// app/components/servers-view.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import Image from 'next/image'

interface GuildInfo {
  id: string
  name: string
  icon: string
}

interface ServerConfig {
  id: number
  guild_id: string
  guild_info: GuildInfo
  channel_id: string
  game_type: string
  server_ip: string
  server_port: number
  message_interval: number
}

const gameTypeColors: { [key: string]: string } = {
  'minecraft': 'bg-emerald-600 text-white',
  'valorant': 'bg-rose-600 text-white',
  'csgo': 'bg-amber-600 text-white',
  'default': 'bg-sky-600 text-white'
}

export default function ColorfulServersView() {
  const [servers, setServers] = useState<ServerConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingServer, setEditingServer] = useState<ServerConfig | null>(null)
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const form = useForm<ServerConfig>()

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/server-config')
      if (response.ok) {
        const data = await response.json()
        const serversWithGuildInfo = await Promise.all(data.map(async (server: ServerConfig) => {
          const guildResponse = await fetch(`/api/discord?action=getGuild&guildId=${server.guild_id}`)
          if (guildResponse.ok) {
            const guildInfo = await guildResponse.json()
            return { ...server, guild_info: guildInfo }
          }
          return server
        }))
        setServers(serversWithGuildInfo)
      } else {
        throw new Error('Failed to fetch servers')
      }
    } catch (error) {
      console.error('Error fetching servers:', error)
      setAlert({ type: 'error', message: "Failed to load servers" })
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
        setAlert({ type: 'success', message: "Server deleted successfully" })
        clearAlert()
        fetchServers()
      } else {
        throw new Error('Failed to delete server')
      }
    } catch (error) {
      console.error('Error deleting server:', error)
      setAlert({ type: 'error', message: "Failed to delete server" })
      clearAlert()
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
        setAlert({ type: 'success', message: "Server updated successfully" })
        clearAlert()
        setEditModalOpen(false)
        fetchServers()
      } else {
        throw new Error('Failed to update server')
      }
    } catch (error) {
      console.error('Error updating server:', error)
      setAlert({ type: 'error', message: "Failed to update server" })
      clearAlert()
    }
  }

  const clearAlert = () => {
    setTimeout(() => setAlert(null), 5000)
  }

  return (
    <div className="container mx-auto py-10" style={{ backgroundColor: '#212121' }}>
      {alert && (
        <Alert variant={alert.type === 'error' ? "destructive" : "default"} className="mb-4">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}
      <h2 className="text-2xl font-bold mb-5 text-white">Server Configurations</h2>
      <div className="rounded-md border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-800">
              <TableHead className="text-white">Guild</TableHead>
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
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-white" />
                </TableCell>
              </TableRow>
            ) : (
              servers.map((server, index) => (
                <TableRow key={server.id} className={index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'}>
                  <TableCell className="text-white">
                    <div className="flex items-center">
                      {server.guild_info?.icon && (
                        <Image
                          src={`https://cdn.discordapp.com/icons/${server.guild_info.id}/${server.guild_info.icon}.png`}
                          alt={`${server.guild_info.name} icon`}
                          width={32}
                          height={32}
                          className="rounded-full mr-2 border-2 border-gray-600"
                        />
                      )}
                      {server.guild_info?.name || server.guild_id}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{server.channel_id}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${gameTypeColors[server.game_type.toLowerCase()] || gameTypeColors['default']}`}>
                      {server.game_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-300">{server.server_ip}</TableCell>
                  <TableCell className="text-gray-300">{server.server_port}</TableCell>
                  <TableCell className="text-gray-300">{server.message_interval}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(server)} className="text-blue-400 hover:text-blue-300">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(server.id)} className="text-red-400 hover:text-red-300">
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
        <DialogContent className="bg-gray-800 text-white">
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
                      <Input {...field} className="bg-gray-700 text-white border-gray-600" />
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
                      <Input {...field} className="bg-gray-700 text-white border-gray-600" />
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
                      <Input {...field} className="bg-gray-700 text-white border-gray-600" />
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
                      <Input {...field} type="number" className="bg-gray-700 text-white border-gray-600" />
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
                      <Input {...field} type="number" className="bg-gray-700 text-white border-gray-600" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
