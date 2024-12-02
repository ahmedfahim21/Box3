'use client'

import { useState, useEffect } from 'react'
import { Package, Truck, CheckCircle, AlertCircle, BarChart3, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React from "react";
import dynamic from "next/dynamic";
import { useSession } from 'next-auth/react'
import { useAppContext } from '@/components/AppContext'
import { metadata } from '../layout'
import { ethers } from 'ethers'

const WebcamCaptureModal = dynamic(
  () => import("../../../components/WebcamCapture"),
  { ssr: false }
);
// Mock data to simulate fetching from the blockchain
const mockOrders = [
  { id: 1, customer: '0x1234...5678', metadata: 'Books', status: 'Pending', value: 0.01 },
  { id: 2, customer: '0x2345...6789', metadata: 'Electronics', status: 'Pending', value: 0.05 },
  { id: 3, customer: '0x3456...7890', metadata: 'Clothing', status: 'Pending', value: 0.02 },
]

const mockPackages = [
  { id: 1, cid: 'Qm...1', metadata: 'Books', customer: '0x1234...5678', delivered: false, fundsReleased: false, funds: 0.01 },
  { id: 2, cid: 'Qm...2', metadata: 'Electronics', customer: '0x2345...6789', delivered: true, fundsReleased: false, funds: 0.05 },
  { id: 3, cid: 'Qm...3', metadata: 'Clothing', customer: '0x3456...7890', delivered: true, fundsReleased: true, funds: 0.02 },
]

export default function DeliveryAgentDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [orders, setOrders] = useState([])
  const [packages, setPackages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, delivered: 0, pending: 0, totalValue: 0 })


  const { data: session } = useSession();
  const { apiKey, setApiKey, buildType, setBuildType, account, setAccount, role, setRole, contract, setContract } = useAppContext();

  useEffect(() => {
    // Simulating API call to fetch orders and packages from the blockchain
    const fetchData = async () => {

      if(contract){
        const fetchOrders = await contract.getAllOrders();

        console.log(fetchOrders.funds);
      }


      setOrders(mockOrders)
      setPackages(mockPackages)
      setIsLoading(false)
      calculateStats(mockPackages)
    }

    fetchData()
  }, [contract])

  const calculateStats = (pkgs) => {
    const total = pkgs.length
    const delivered = pkgs.filter(pkg => pkg.delivered).length
    const pending = total - delivered
    const totalValue = pkgs.reduce((sum, pkg) => sum + pkg.funds, 0)
    setStats({ total, delivered, pending, totalValue })
  }

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

  const handleMarkAsDelivered = async (packageId: number) => {
    // Here you would call the smart contract function to mark as delivered
    console.log(`Marking package ${packageId} as delivered`)
    // For demo purposes, we'll just update the local state
    const updatedPackages = packages.map(pkg =>
      pkg.id === packageId ? { ...pkg, delivered: true } : pkg
    )
    setPackages(updatedPackages)
    calculateStats(updatedPackages)
  }

  const handleCreatePackage = async (formData) => {
    try {
      console.log('Creating new package:', formData);
  
      // Format funds to appropriate format (assuming ETH)
      // const funds = ethers.utils.parseEther(formData.funds.toString());
  
      // Call the smart contract function
      const tx = await contract.createPackage(
        formData.metadata,
        formData.cid,
        formData.customer,
        formData.funds
      );
      console.log('Transaction sent:', tx);
  
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
  
      // Create the new package object
      const newPackage = {
        id: packages.length + 1,
        cid: formData.cid,
        metadata: formData.metadata,
        customer: formData.customer,
        delivered: false,
        fundsReleased: false,
        funds: formData.funds // Keep as string for display purposes
      };
  
      // Update state after successful transaction
      const updatedPackages = [...packages, newPackage];
      setPackages(updatedPackages);
      calculateStats(updatedPackages);
  
    } catch (error) {
      console.error('Error creating package:', error);
      // Optionally display error feedback to the user
    }
  };
  

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Delivery Agent Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Packages" value={stats.total} icon={<Package className="h-8 w-8" />} />
        <StatCard title="Delivered" value={stats.delivered} icon={<Truck className="h-8 w-8" />} />
        <StatCard title="Pending" value={stats.pending} icon={<AlertCircle className="h-8 w-8" />} />
        <StatCard title="Total Value" value={`${stats.totalValue} ETH`} icon={<BarChart3 className="h-8 w-8" />} />
      </div>

      {/* Orders and Packages Tabs */}
      <Tabs defaultValue="orders" className="mb-8">
        <TabsList>
          <TabsTrigger value="orders">Customer Orders</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Customer Orders</CardTitle>
              <CardDescription>Orders created by customers waiting to be packaged</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-4">
                  <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold">No orders found</p>
                  <p className="text-sm text-muted-foreground">New orders will appear here when created by customers</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contents</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.metadata}</TableCell>
                        <TableCell>{order.value} ETH</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <CreatePackageDialog order={order} onCreatePackage={handleCreatePackage} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="packages">
          <Card>
            <CardHeader>
              <CardTitle>All Packages</CardTitle>
              <CardDescription>Manage and track all packages in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-4">
                  <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold">No packages found</p>
                  <p className="text-sm text-muted-foreground">New packages will appear here when created</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>CID</TableHead>
                      <TableHead>Contents</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell>{pkg.id}</TableCell>
                        <TableCell>{pkg.cid}</TableCell>
                        <TableCell>{pkg.metadata}</TableCell>
                        <TableCell>{pkg.customer}</TableCell>
                        <TableCell>{pkg.funds} ETH</TableCell>
                        <TableCell>
                          <Badge variant={pkg.fundsReleased ? 'default' : pkg.delivered ? 'secondary' : 'outline'}>
                            {getStatusIcon(pkg.delivered, pkg.fundsReleased)}
                            <span className="ml-2">{getStatusText(pkg.delivered, pkg.fundsReleased)}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" className='mx-2' onClick={openModal}>Open Webcam</Button>
                          <WebcamCaptureModal isOpen={isModalOpen} onClose={closeModal} />
                          {!pkg.delivered && (
                            <Button size="sm" onClick={() => handleMarkAsDelivered(pkg.id)}>
                              Mark Delivered
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  )
}

function StatCard({ title, value, icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

function CreatePackageDialog({ order, onCreatePackage }) {
  const [formData, setFormData] = useState({
    metadata: order.metadata,
    customer: order.customer,
    funds: order.value.toString(),
    cid: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreatePackage(formData)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Package
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Create Package</DialogTitle>
          <DialogDescription>
            Create a new package for the customer order. Add the required metadata and CID.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metadata" className="text-right">
                Contents
              </Label>
              <Textarea
                id="metadata"
                name="metadata"
                value={formData.metadata}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Customer
              </Label>
              <Input
                id="customer"
                name="customer"
                value={formData.customer}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="funds" className="text-right">
                Value (ETH)
              </Label>
              <Input
                id="funds"
                name="funds"
                type="number"
                value={formData.funds}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cid" className="text-right">
                CID
              </Label>
              <Input
                id="cid"
                name="cid"
                value={formData.cid}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Package</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

