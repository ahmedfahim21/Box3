'use client'

import { useState, useEffect } from 'react'
import { Package, Truck, CheckCircle, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// Mock data to simulate fetching from the blockchain
const mockPackages = [
  { id: 1, cid: 'Qm...1', metadata: 'Books', delivered: false, fundsReleased: false, funds: 50 },
  { id: 2, cid: 'Qm...2', metadata: 'Electronics', delivered: true, fundsReleased: false, funds: 200 },
  { id: 3, cid: 'Qm...3', metadata: 'Clothing', delivered: true, fundsReleased: true, funds: 75 },
]

export default function CustomerDashboard() {
  const [packages, setPackages] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulating API call to fetch packages from the blockchain
    const fetchPackages = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate network delay
      setPackages(mockPackages)
      setIsLoading(false)
    }

    fetchPackages()
  }, [])

  const getStatusIcon = (delivered: boolean, fundsReleased: boolean) => {
    if (fundsReleased) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (delivered) return <Truck className="h-5 w-5 text-blue-500" />
    return <Package className="h-5 w-5 text-yellow-500" />
  }

  const getStatusText = (delivered: boolean, fundsReleased: boolean) => {
    if (fundsReleased) return 'Completed'
    if (delivered) return 'Delivered'
    return 'In Transit'
  }

  const handleReleaseFunds = async (packageId: number) => {
    // Here you would call the smart contract function to release funds
    console.log(`Releasing funds for package ${packageId}`)
    // For demo purposes, we'll just update the local state
    setPackages(packages.map(pkg => 
      pkg.id === packageId ? { ...pkg, fundsReleased: true } : pkg
    ))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Packages</h1>
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[300px]" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-[120px]" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40">
            <AlertCircle className="h-10 w-10 text-yellow-500 mb-4" />
            <p className="text-lg font-semibold">No packages found</p>
            <p className="text-sm text-muted-foreground">Your ordered packages will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg) => (
            <Card key={pkg.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Package #{pkg.id}</span>
                  <Badge variant={pkg.fundsReleased ? 'default' : pkg.delivered ? 'secondary' : 'outline'}>
                    {getStatusIcon(pkg.delivered, pkg.fundsReleased)}
                    <span className="ml-2">{getStatusText(pkg.delivered, pkg.fundsReleased)}</span>
                  </Badge>
                </CardTitle>
                <CardDescription>CID: {pkg.cid}</CardDescription>
              </CardHeader>
              <CardContent>
                <p><strong>Contents:</strong> {pkg.metadata}</p>
                <p><strong>Value:</strong> ${pkg.funds}</p>
              </CardContent>
              <CardFooter>
                {pkg.delivered && !pkg.fundsReleased && (
                  <Button onClick={() => handleReleaseFunds(pkg.id)}>
                    Release Funds
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

