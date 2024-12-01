'use client'

import { useState, useEffect } from 'react'
import { Package, Truck, CheckCircle, AlertCircle, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { OktoContextType, useOkto } from 'okto-sdk-react'
import { useAppContext } from '@/components/AppContext'
import { ethers } from 'ethers'

// Mock data to simulate fetching from the blockchain
const mockPackages = [
  { id: 1, cid: 'Qm...1', metadata: 'Books', delivered: false, fundsReleased: false, funds: 0.01 },
  { id: 2, cid: 'Qm...2', metadata: 'Electronics', delivered: true, fundsReleased: false, funds: 0.05 },
  { id: 3, cid: 'Qm...3', metadata: 'Clothing', delivered: true, fundsReleased: true, funds: 0.02 },
]

export default function CustomerDashboard() {
  interface Package {
    id: number;
    cid: string;
    metadata: string;
    delivered: boolean;
    fundsReleased: boolean;
    funds: number
  }
  
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession();
  const { apiKey, setApiKey, buildType, setBuildType, account, setAccount, role, setRole, contract, setContract } = useAppContext();
  const {
    isLoggedIn,
  } = useOkto() as OktoContextType;

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);

        if (contract) {
          const packageData = await contract.getMyPackageDetails();
          const formattedPackages = packageData.map((pkg, index) => ({
            id: index + 1,
            metadata: pkg.metadata,
            cid: pkg.cid,
            funds: ethers.utils.formatEther(pkg.funds),
            delivered: pkg.delivered,
            fundsReleased: pkg.fundsReleased,
          }));
          setPackages([...formattedPackages, ...mockPackages]); // Append mock packages
        } else {
          setPackages(mockPackages); // Fallback if no contract data
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        setPackages(mockPackages); // Fallback in case of error
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, [contract]);

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

  const handleOpenBox = async (packageId: number) => {
    console.log(`Releasing funds for package ${packageId}`);
    setPackages(packages.map(pkg =>
      pkg.id === packageId ? { ...pkg, fundsReleased: true } : pkg
    ));
    await actuateServo();
  };
  
  const readRFID = async (packageId: number) => {
    try {

      const response = await axios.get(`http://192.168.167.131:8000/api/get_tag/`);
      const { tag_id: rfidFromAPI } = response.data;
  
      console.log(`Fetched RFID: ${rfidFromAPI}`);
  
      const userData = await contract.getUserDetails(); // Update the Contract and add this function
      const { rfidData } = userData;
  
      console.log(`RFID from Contract: ${rfidData}`);
  
      if (rfidFromAPI === rfidData) {
        alert('RFID matched! Opening SmartBox...');
        handleOpenBox(packageId); 
      } else {
        alert('RFID mismatch! Access denied.');
      }
    } catch (error) {
      console.error('Error reading RFID or fetching user data:', error);
      alert('Error verifying RFID.');
    }
  };


  const verifyPackage = async () => {
    try {
      const response = await axios.post(
        'http://192.168.167.131:8000/api/verify_package/',
        {
          product_description: "A brown rugby ball.",
          image_url: "https://aqua-legislative-cod-798.mypinata.cloud/ipfs/QmaWvn63nPwCjndRz1vnmFrymvmqJcpRZsBmw9DegVmeSs"
        }
      );
      console.log(response.data);
      // {isValidPackage: true, reason: 'Although the package description does not directly…e packaging appears to be related to the product.'}
    } catch (error) {
      console.log(error);
      alert('Error generating key');
    }
  };

  const actuateServo = async () => {
    try {
      const response = await axios.get(`http://192.168.167.131:8000/api/servo/`);
      console.log(response.data);
      // {message: success} - 200
    } catch (error) {
      console.log(error);
      alert('Error generating key');
    }
  };

  const handleCreateOrder = async (orderData) => {
    // Here you would call the smart contract function to create a new order
    console.log('Creating new order:', orderData)
    // For demo purposes, we'll just add a new package to the local state
    const newPackage = {
      id: packages.length + 1,
      cid: 'Qm...new',
      metadata: orderData.contents,
      delivered: false,
      fundsReleased: false,
      funds: parseFloat(orderData.value)
    }
    // CREATE FUNCTION ON CONTRACT TO HANDLE ORDERS SUCH THAT USER PAYS

    setPackages([...packages, newPackage])
  }



  return (
    <div className="container mx-auto px-4 py-8">
      {/* { account && role === 1 ? ( */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Packages</h1>
          <div className='flex items-center space-x-4'>
            <div className={`w-3 h-3 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                Status: {isLoggedIn ? 'Logged In' : 'Not Logged In'}
              </span>
            </div>
            <CreateOrderDialog/>

          </div>
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
                    <p><strong>Value:</strong>{pkg.funds} ETH</p>
                  </CardContent>
                  <CardFooter>
                    {pkg.delivered && !pkg.fundsReleased && (
                      <Button onClick={() => readRFID(pkg.id)}>
                        Open Box
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>

          )}
        </div>
        {/* ) : ( */}
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-lg font-semibold">You are not authorized to view this page</p>
          <p className="text-sm text-muted-foreground">Please log in as a customer to access this page</p>
        </div>
        {/* )} */}
      </div>
      )
}


function CreateOrderDialog({ onCreateOrder }) {
  const [orderData, setOrderData] = useState({
    contents: '',
    value: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setOrderData(prevData => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreateOrder(orderData)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Create a new order for package delivery. Please provide the package contents and value.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contents" className="text-right">
                Contents
              </Label>
              <Textarea
                id="contents"
                name="contents"
                value={orderData.contents}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Describe the package contents"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Value (ETH)
              </Label>
              <Input
                id="value"
                name="value"
                type="number"
                value={orderData.value}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Enter package value"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


