// app/components/StatusPage/status-page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, TrendingUp, TrendingDown, Users, Server } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ServerStatus {
  id: number
  name: string
  game_type: string
  server_ip: string
  server_port: number
  status: 'online' | 'offline'
  players: number
  max_players: number
  player_history: { timestamp: string, player_count: number }[]
}

export default function StatusPage() {
  const [servers, setServers] = useState<ServerStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServerStatus()
    const interval = setInterval(fetchServerStatus, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchServerStatus = async () => {
    try {
      const response = await fetch('/api/server-status')
      if (!response.ok) throw new Error('Failed to fetch server status')
      const data = await response.json()
      setServers(data)
      setError(null)
    } catch (err) {
      setError('Failed to load server status. Please try again later.')
      console.error('Error fetching server status:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <StatusPageSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-[#333333] border-[#2dd4bf]">
        <AlertCircle className="h-4 w-4 text-[#2dd4bf]" />
        <AlertTitle className="text-[#2dd4bf]">Error</AlertTitle>
        <AlertDescription className="text-white">{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto py-10 text-white min-h-screen ">
      <h1 className="text-4xl font-bold mb-8 text-center text-[#2dd4bf]">Game Server Status</h1>
      <div className="flex flex-col items-center space-y-8 w-full max-w-4xl mx-auto">
        {servers.map((server) => (
          <ServerCard key={server.id} server={server} />
        ))}
      </div>
    </div>
  )
}

function ServerCard({ server }: { server: ServerStatus }) {
  const [isOpen, setIsOpen] = useState(false)
  const chartConfig = {
    players: {
      label: "Players",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  const chartData = server.player_history.map(history => ({
    timestamp: new Date(history.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    players: history.player_count
  }))

  const trend = chartData.length > 1 
    ? chartData[chartData.length - 1].players - chartData[0].players 
    : 0

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full max-w-4xl"
    >
      <Card className="bg-[#333333] border-[#2dd4bf] overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#2dd4bf]/20">
        <CardHeader className="bg-[#2a2a2a]">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl text-[#2dd4bf]">
              <Server className="h-5 w-5 text-[#2dd4bf]" />
              {server.name}
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0 text-[#2dd4bf] hover:bg-[#2dd4bf] hover:text-[#212121]">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardDescription className="text-gray-400">{server.game_type}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 flex justify-between items-center">
            <p className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#2dd4bf]" />
              <span className="font-semibold">{server.players}/{server.max_players}</span> Players
            </p>
            <Badge variant={server.status === 'online' ? 'default' : 'destructive'} className="uppercase bg-[#2dd4bf] text-[#212121]">
              {server.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-400 mb-4">{server.server_ip}:{server.server_port}</p>
          <CollapsibleContent>
            <div className="mt-4 bg-[#2a2a2a] rounded-lg overflow-hidden">
              <ChartContainer config={chartConfig} className="h-96">
                {/* Wrap the ResponsiveContainer in a fragment */}
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis 
                        dataKey="timestamp" 
                        stroke="#888" 
                        tickFormatter={(value) => value.slice(0, 5)}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#888" 
                        tick={{ fontSize: 12 }}
                        domain={[0, 'dataMax + 5']}
                      />
                      <ChartTooltip
                        cursor={{ stroke: '#555', strokeWidth: 1 }}
                        content={<CustomTooltip />}
                      />
                      <Line
                        type="monotone"
                        dataKey="players"
                        stroke="#2dd4bf"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              </ChartContainer>
            </div>
          </CollapsibleContent>
        </CardContent>
        <CollapsibleContent>
          <CardFooter className="flex-col items-start gap-2 text-sm bg-[#2a2a2a] mt-4 p-4">
            <div className="flex gap-2 font-medium leading-none">
              {trend > 0 ? (
                <span className="flex items-center text-green-400">
                  Trending up by {trend} players <TrendingUp className="h-4 w-4 ml-1" />
                </span>
              ) : trend < 0 ? (
                <span className="flex items-center text-red-400">
                  Trending down by {Math.abs(trend)} players <TrendingDown className="h-4 w-4 ml-1" />
                </span>
              ) : (
                <span className="text-gray-400">No change in player count</span>
              )}
            </div>
            <div className="leading-none text-gray-400 mt-2">
              Showing player count for the last 24 hours
            </div>
          </CardFooter>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#333333] border border-[#2dd4bf] p-3 rounded shadow">
        <p className="text-[#2dd4bf] font-semibold mb-1">{`Time: ${label}`}</p>
        <p className="text-white font-bold">{`Players: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
}

function StatusPageSkeleton() {
  return (
    <div className="container mx-auto py-10 bg-[#2a2a2a] text-white min-h-screen">
      <Skeleton className="h-10 w-[300px] mb-8 mx-auto bg-[#333333]" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-[#333333] border-[#2dd4bf]">
            <CardHeader className="bg-[#2a2a2a]">
              <Skeleton className="h-6 w-[150px] bg-[#333333]" />
              <Skeleton className="h-4 w-[100px] bg-[#333333]" />
            </CardHeader>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-[200px] mb-2 bg-[#2a2a2a]" />
              <Skeleton className="h-4 w-[150px] mb-4 bg-[#2a2a2a]" />
              <Skeleton className="h-[200px] w-full bg-[#2a2a2a]" />
            </CardContent>
            <CardFooter className="bg-[#2a2a2a] mt-4">
              <Skeleton className="h-4 w-[200px] bg-[#333333]" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
