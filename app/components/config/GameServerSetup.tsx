// app/components/config/server-config.tsx

'use client';

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ServerConfig {
  guildId: string
  channelId: string
  gameType: string
  serverIp: string
  serverPort: string
  messageInterval: number
}

const gameTypes = [
  { value: 'minecraft', label: 'Minecraft' },
  { value: 'csgo', label: 'Counter-Strike: Global Offensive' },
  { value: 'arma3', label: 'Arma 3' },
  { value: 'valheim', label: 'Valheim' },
  { value: 'rust', label: 'Rust' },
  { value: 'terraria', label: 'Terraria' },
  { value: 'factorio', label: 'Factorio' },
  { value: 'satisfactory', label: 'Satisfactory' },
  { value: 'ark', label: 'ARK: Survival Evolved' },
  { value: 'sevendays', label: '7 Days to Die' },
  // Add more game types as needed
]

export default function ServerConfigForm({ guildId }: { guildId: string }) {
  const [channels, setChannels] = useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<ServerConfig>()
  const [gameTypeSearch, setGameTypeSearch] = useState("")
  const [openGameType, setOpenGameType] = React.useState(false)

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(`/api/discord?action=getChannels&guildId=${guildId}`)
        if (response.ok) {
          const channelData = await response.json()
          setChannels(channelData.filter((channel: any) => channel.type === 0)) 
        }
      } catch (error) {
        console.error('Failed to fetch channels:', error)
        setAlert({
          type: 'error',
          message: "Failed to fetch channels. Please try again."
        })
      }
    }

    if (guildId) {
      fetchChannels()
    }
  }, [guildId])

  const onSubmit = async (data: ServerConfig) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/server-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          messageInterval: parseInt(data.messageInterval.toString(), 10) || 60
        }),
      })

      if (response.ok) {
        setAlert({
          type: 'success',
          message: "Your server configuration has been saved successfully."
        })
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving configuration:', error)
      setAlert({
        type: 'error',
        message: "Failed to save server configuration. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>Server Configuration</CardTitle>
        <CardDescription>Configure your game server settings</CardDescription>
      </CardHeader>
      <CardContent>
        {alert && (
          <Alert variant={alert.type === 'error' ? "destructive" : "default"} className="mb-6">
            <AlertTitle>{alert.type === 'error' ? "Error" : "Success"}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" name="guildId" value={guildId} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="channelId">Channel</Label>
              <Controller
                name="channelId"
                control={control}
                rules={{ required: 'Channel is required' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.channelId && <p className="text-sm text-red-500">{errors.channelId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gameType">Game Type</Label>
              <Controller
                name="gameType"
                control={control}
                rules={{ required: 'Game type is required' }}
                render={({ field }) => (
                  <Popover open={openGameType} onOpenChange={setOpenGameType}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openGameType}
                        className="w-full justify-between"
                      >
                        {field.value
                          ? gameTypes.find((game) => game.value === field.value)?.label
                          : "Select game type..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search game type..." />
                        <CommandList>
                          <CommandEmpty>No game type found.</CommandEmpty>
                          <CommandGroup>
                            {gameTypes.map((game) => (
                              <CommandItem
                                key={game.value}
                                value={game.value}
                                onSelect={(currentValue) => {
                                  field.onChange(currentValue === field.value ? "" : currentValue)
                                  setOpenGameType(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === game.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {game.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.gameType && <p className="text-sm text-red-500">{errors.gameType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serverIp">Server IP</Label>
              <Controller
                name="serverIp"
                control={control}
                rules={{ required: 'Server IP is required' }}
                render={({ field }) => (
                  <Input {...field} placeholder="Enter server IP" />
                )}
              />
              {errors.serverIp && <p className="text-sm text-red-500">{errors.serverIp.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serverPort">Server Port</Label>
              <Controller
                name="serverPort"
                control={control}
                rules={{ required: 'Server port is required' }}
                render={({ field }) => (
                  <Input {...field} placeholder="Enter server port" />
                )}
              />
              {errors.serverPort && <p className="text-sm text-red-500">{errors.serverPort.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageInterval">Message Interval (minutes)</Label>
              <Controller
                name="messageInterval"
                control={control}
                rules={{ required: 'Message interval is required', min: { value: 1, message: 'Minimum interval is 1 minute' } }}
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="Enter message interval" />
                )}
              />
              {errors.messageInterval && <p className="text-sm text-red-500">{errors.messageInterval.message}</p>}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Configuration'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
