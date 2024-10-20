// app/components/ServerConfigurationManager.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import Image from 'next/image'
import { Checkbox } from "@/components/ui/checkbox"

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
  show_graph: boolean
  show_player_list: boolean
}

const gameTypeColors: { [key: string]: string } = {
  'minecraft': 'bg-[#2dd4bf] text-[#212121]',
  'valorant': 'bg-[#2dd4bf] text-[#212121]',
  'csgo': 'bg-[#2dd4bf] text-[#212121]',
  'default': 'bg-[#2dd4bf] text-[#212121]'
}

export default function ServerConfigurationManager() {
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
      const response = await fetch(`/api/server-config/${id}`, { method: 'DELETE' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAlert({ type: 'success', message: "Server deleted successfully" });
          fetchServers();
        } else {
          throw new Error('Failed to delete server');
        }
      } else if (response.status === 404) {
        setAlert({ type: 'error', message: "Server configuration not found" });
      } else {
        throw new Error('Failed to delete server');
      }
    } catch (error) {
      console.error('Error deleting server:', error);
      setAlert({ type: 'error', message: "Failed to delete server" });
    }
    clearAlert();
  }

  const handleEditSubmit = async (values: ServerConfig) => {
    if (!editingServer) return

    try {
      const response = await fetch(`/api/server-config/${editingServer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          show_graph: values.show_graph,
          show_player_list: values.show_player_list
        }),
      })

      if (response.ok) {
        const updatedServer = await response.json()
        setAlert({ type: 'success', message: "Server updated successfully" })
        clearAlert()
        setEditModalOpen(false)
        // Update the server in the local state
        setServers(prevServers => prevServers.map(server => 
          server.id === updatedServer.id ? { ...server, ...updatedServer } : server
        ))
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
    <div className="container mx-auto py-10 bg-[#212121] text-white">
      {alert && (
        <Alert variant={alert.type === 'error' ? "destructive" : "default"} className="mb-4">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}
      <h2 className="text-2xl font-bold mb-5 text-[#2dd4bf]">Server Configurations</h2>
      <div className="rounded-md border border-[#2dd4bf] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#2a2a2a]">
              <TableHead className="text-[#2dd4bf]">Guild</TableHead>
              <TableHead className="text-[#2dd4bf]">Channel ID</TableHead>
              <TableHead className="text-[#2dd4bf]">Game Type</TableHead>
              <TableHead className="text-[#2dd4bf]">Server IP</TableHead>
              <TableHead className="text-[#2dd4bf]">Server Port</TableHead>
              <TableHead className="text-[#2dd4bf]">Message Interval</TableHead>
              <TableHead className="text-[#2dd4bf]">Show Graph</TableHead>
              <TableHead className="text-[#2dd4bf]">Show Player List</TableHead>
              <TableHead className="text-[#2dd4bf]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2dd4bf]" />
                </TableCell>
              </TableRow>
            ) : (
              servers.map((server, index) => (
                <TableRow key={server.id} className={index % 2 === 0 ? 'bg-[#2a2a2a]' : 'bg-[#333333]'}>
                  <TableCell className="text-white">
                    <div className="flex items-center">
                      {server.guild_info?.icon && (
                        <Image
                          src={`https://cdn.discordapp.com/icons/${server.guild_info.id}/${server.guild_info.icon}.png`}
                          alt={`${server.guild_info.name} icon`}
                          width={32}
                          height={32}
                          className="rounded-full mr-2 border-2 border-[#2dd4bf]"
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
                  <TableCell className="text-gray-300">
                    <Checkbox checked={server.show_graph} disabled />
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <Checkbox checked={server.show_player_list} disabled />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(server)} className="text-[#2dd4bf] hover:text-[#20a08d]">
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
        <DialogContent className="bg-[#2a2a2a] text-white">
          <DialogHeader>
            <DialogTitle className="text-[#2dd4bf]">Edit Server Configuration</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="channel_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2dd4bf]">Channel ID</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-[#333333] text-white border-[#2dd4bf]" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="game_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2dd4bf]">Game Type</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-[#333333] text-white border-[#2dd4bf]" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="server_ip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2dd4bf]">Server IP</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-[#333333] text-white border-[#2dd4bf]" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="server_port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2dd4bf]">Server Port</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-[#333333] text-white border-[#2dd4bf]" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message_interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2dd4bf]">Message Interval</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-[#333333] text-white border-[#2dd4bf]" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="show_graph"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-[#2dd4bf]">
                        Show Graph
                      </FormLabel>
                      <FormDescription>
                        Display a graph of player count over time
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="show_player_list"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-[#2dd4bf]">
                        Show Player List
                      </FormLabel>
                      <FormDescription>
                        Display a list of current players
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="bg-[#2dd4bf] hover:bg-[#20a08d] text-[#212121]">Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
