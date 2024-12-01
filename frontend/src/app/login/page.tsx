'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession, signOut } from "next-auth/react";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Package, Truck, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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
import Image from 'next/image';

// const CONTRACT_ABI = SmartBoxABI;
// const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;


export default function OnboardingForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [rfid, setRfid] = useState('');
    const [selectedChain, setSelectedChain] = useState('');
    const [selectedToken, setSelectedToken] = useState('');
    const [role, setRole] = useState("customer")
    const [networks, setNetworks] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [walletsExist, setWalletsExist] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState('');
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

            getSupportedNetworks().then((data) => {
                setNetworks(data.network || []);
            });

            // Fetch wallets 
            getWallets().then((data) => {
                setWallets(data.wallets || []);
            });

            if (wallets.length > 0) {
                setWalletsExist(true);
            }
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
    }, [isLoggedIn, getSupportedNetworks, getWallets]);

    const handleCreateWallet = () => {
        createWallet().then((data) => {
            console.log(data)
        });
    };

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


    const handleRegister = () => {
        setIsLoading(true);
        // Registration logic
    };



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
        <div className="container mx-auto px-6 py-10 bg-gray-100 dark:bg-gray-900">
            <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">

                <div className="flex items-center justify-center mb-8">
                    <Image src="/box3-diag.png" alt="BOX3 Logo" width={60} height={60} />
                    <h1 className="text-3xl font-bold ml-4">BOX3 Onboarding</h1>
                </div>

                <div className="w-full max-w-lg">
                    <EmailOTPVerification
                        onVerificationSuccess={() => console.log('Verification successful')}
                        onVerificationError={(error) => console.error('Verification failed:', error)}
                    />
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Select your role
                        </Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger id="role" className="w-full">
                                <SelectValue placeholder="Choose your role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="customer" className="cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-primary" />
                                        <span>Customer</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="deliveryAgent" className="cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        <Truck className="w-4 h-4 text-black" />
                                        <span>Delivery Agent</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>





                    {/* Create Wallet Button */}
                    {
                        walletsExist ?
                            (
                                <div>
                                    <Label className="text-sm font-semibold text-gray-800 dark:text-gray-200 my-4">
                                        You can now pay and receive via these networks:
                                    </Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {networks.map((network) => (
                                            <div
                                                key={network.chain_id}
                                                className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <img src={network.logo} alt={network.network_name} className="w-4 h-4" />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {network.network_name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) :
                            <Button className="w-full" onClick={handleCreateWallet}>
                                Create Wallet
                            </Button>
                    }


                    <div className="my-6">
                        <Input
                            id="rfidData"
                            placeholder="Scan RFID data"
                            value={rfid}
                            onChange={(e) => setRfid(e.target.value)}
                            disabled={true}
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:text-gray-500"
                        />
                    </div>

                    <Button className='w-full py-2 mb-2 rounded-lg hover:bg-primarydark text-white' onClick={scanRFID}>
                        Scan RFID
                    </Button>


                    <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm">
                        <div className={`w-3 h-3 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium">
                            Status: {isLoggedIn ? 'Logged In' : 'Not Logged In'}
                        </span>
                    </div>

                    <Button type="submit" className="w-full py-2 rounded-lg hover:bg-primarydark text-white" disabled={isLoading} onClick={handleRegister}>
                        {isLoading ? 'Registering...' : 'Register'}
                    </Button>
                </div>
            </div>

            <div className="space-y-6 mx-auto mt-8">
                <div className="space-y-4">
                    {apiKey}
                </div>
                =



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

