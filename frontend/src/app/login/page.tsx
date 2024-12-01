'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession, signOut } from "next-auth/react";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Package, Truck, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '../../hooks/use-toast'

import { LoginButton } from "@/components/LoginButton";
import { useOkto, OktoContextType, BuildType } from "okto-sdk-react";
import GetButton from "@/components/GetButton";
import { useAppContext } from "@/components/AppContext";
import { EmailOTPVerification } from "@/components/EmailOTPVerification";
import AuthButton from '@/components/AuthButton';
import axios from 'axios';

// const CONTRACT_ABI = SmartBoxABI;
// const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  role: z.enum(['customer', 'deliveryAgent'], {
    required_error: 'Please select a role.',
  }),
  rfidData: z.string().min(1, {
    message: 'RFID data is required.',
  }),
})

export default function OnboardingForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [rfid, setRfid] = useState("")
  const { data: session } = useSession();
  const { apiKey, setApiKey, buildType, setBuildType } = useAppContext();
  const {
    isLoggedIn,
    authenticate,
    authenticateWithUserId,
    logOut,
    getPortfolio,
    transferTokens,
    getWallets,
    createWallet,
    getSupportedNetworks,
    getSupportedTokens,
    getUserDetails,
    orderHistory,
    getNftOrderDetails,
    showWidgetModal,
    showOnboardingModal,
    getRawTransactionStatus,
    transferTokensWithJobStatus,
    transferNft,
    transferNftWithJobStatus,
    executeRawTransaction,
    executeRawTransactionWithJobStatus,
    setTheme,
    getTheme,
  } = useOkto() as OktoContextType;
  const idToken = useMemo(() => (session ? session.id_token : null), [session]);

  useEffect(() => {
    setApiKey(process.env.NEXT_PUBLIC_OKTA_API_KEY);
    setBuildType(BuildType.SANDBOX)
    if (isLoggedIn) {
      console.log("Okto is authenticated");
    }
    // if (window.ethereum) {
    //   const browserProvider = new ethers.BrowserProvider(window.ethereum);
    //   setProvider(browserProvider);

    //   const contractInstance = new ethers.Contract(
    //     CONTRACT_ADDRESS,
    //     CONTRACT_ABI,
    //     browserProvider
    //   );
    //   setContract(contractInstance);
    // } else {
    //   console.error("MetaMask is not installed!");
    // }
  }, [isLoggedIn]);

  //   const connectWallet = async () => {
  //     if (!provider) return;

  //     try {
  //       const accounts = await provider.send("eth_requestAccounts", []);
  //       setAccount(accounts[0]);
  //       console.log("Connected account:", accounts[0]);
  //     } catch (error) {
  //       console.error("Error connecting to MetaMask:", error);
  //     }
  //   };



  async function handleAuthenticate(): Promise<any> {
    if (!idToken) {
      return { result: false, error: "No google login" };
    }
    return new Promise((resolve) => {
      authenticate(idToken, (result: any, error: any) => {
        if (result) {
          console.log("Authentication successful");
          resolve({ result: true });
        } else if (error) {
          console.error("Authentication error:", error);
          resolve({ result: false, error });
        }
      });
    });
  }

  async function handleLogout() {
    try {
      logOut();
      return { result: "logout success" };
    } catch (error) {
      return { result: "logout failed" };
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      rfidData: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    // Here you would typically send the data to your backend or directly to the blockchain
    console.log(values)

    // Simulating an API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsLoading(false)
    toast({
      title: 'Registration Successful',
      description: `You have been registered as a ${values.role === 'customer' ? 'Customer' : 'Delivery Agent'}.`,
    })
  }

  const scanRFID = async () => {
    try {
      const response = await axios.post(`http://192.168.167.131:8000/api/create_tag/`);
      console.log(response.data);
      setRfid(response.data.tag_id);
    } catch (error) {
      console.log(error);
      alert('Error generating key');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center mb-8">
          <Package className="h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold ml-4">BOX3 Onboarding</h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            <div className="w-full max-w-lg">
              <EmailOTPVerification
                onVerificationSuccess={() => console.log('Verification successful')}
                onVerificationError={(error) => console.error('Verification failed:', error)}
              />
            </div>
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="customer" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <User className="w-4 h-4 inline-block mr-2" />
                          Customer
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="deliveryAgent" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <Truck className="w-4 h-4 inline-block mr-2" />
                          Delivery Agent
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rfidData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RFID Data</FormLabel>
                  <FormControl>
                    <Input placeholder="Scan RFID data" disabled={true} {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the RFID data associated with your BOX3 device.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </Form>
        <Button className='w-full' onClick={scanRFID}>
          Scan RFID
        </Button>
        <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm">
          <div className={`w-3 h-3 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium">
            Status: {isLoggedIn ? 'Logged In' : 'Not Logged In'}
          </span>
        </div>

        <div className="space-y-6 w-full max-w-lg">
          <div className="space-y-4">
            {apiKey}
          </div>
          {/* <div className="space-y-4">
          <label className="text-black font-semibold">Build Type:</label>
          <select
            value={buildType}
            onChange={(e) => setBuildType(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={BuildType.SANDBOX}>Sandbox</option>
            <option value={BuildType.STAGING}>Staging</option>
            <option value={BuildType.PRODUCTION}>Production</option>
          </select>
        </div> */}
        </div>



        <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-8">

          {/* <GetButton title="Okto Authenticate" apiFn={handleAuthenticate} />
        <AuthButton authenticateWithUserId={authenticateWithUserId} /> */}
          <GetButton title="Okto Log out" apiFn={handleLogout} />
          <GetButton title="getPortfolio" apiFn={getPortfolio} />
          <GetButton title="getSupportedNetworks" apiFn={getSupportedNetworks} />
          <GetButton title="getSupportedTokens" apiFn={getSupportedTokens} />
          <GetButton title="getUserDetails" apiFn={getUserDetails} />
          <GetButton title="getWallets" apiFn={getWallets} />
          <GetButton title="createWallet" apiFn={createWallet} />
          <GetButton title="orderHistory" apiFn={() => orderHistory({})} />
          {/* <GetButton
          title="getNftOrderDetails"
          apiFn={() => getNftOrderDetails({})}
        /> */}
          <button
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => {
              showWidgetModal();
            }}
          >
            Show Modal
          </button>
          {/* <button
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => {
            showOnboardingModal(AuthType.GAUTH, "Test App");
          }}
        >
          Show Onboarding Modal
        </button> */}
        </div>
      </div>
    </div>
  )
}

