'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Package, Shield, Zap, Menu } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import Link from 'next/link'

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className={`py-4 px-4 md:px-6 lg:px-8 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-md' : ''}`}>
        <nav className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image src="/box3-diag.png" alt="BOX3 Logo" width={50} height={50} />
            <span className="text-2xl font-bold">BOX3</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button className="bg-primary text-background hover:bg-primarydark">Get Started</Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-4">
                  <a href="#features" className="hover:text-primary transition-colors">Features</a>
                  <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
                  <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      <main className="flex-grow pt-20">
        <section className="py-20 px-4 md:px-6 lg:px-8">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primarydark">
                Secure, Smart, Decentralized Deliveries
              </h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto">BOX3 revolutionizes package delivery with blockchain technology, smart contracts, and AI-powered verification.</p>
              <Link href="/login">
                <Button className="bg-primary text-background hover:bg-primarydark text-lg px-8 py-4">
                  Start Secure Deliveries
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section id="features" className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background to-foreground/5">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Shield className="h-12 w-12 text-primary" />}
                title="Blockchain Security"
                description="Leverage the power of blockchain for tamper-proof package tracking and secure payments."
              />
              <FeatureCard
                icon={<Zap className="h-12 w-12 text-primary" />}
                title="AI-Powered Verification"
                description="Our SmartBox uses machine learning to verify package dimensions and authenticity."
              />
              <FeatureCard
                icon={<Package className="h-12 w-12 text-primary" />}
                title="Decentralized Delivery"
                description="Cut out intermediaries and enjoy a truly peer-to-peer delivery experience."
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 px-4 md:px-6 lg:px-8">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">How BOX3 Works</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <ol className="space-y-6">
                  {[
                    { title: "Place Your Order", description: "Buy products through our platform using cryptocurrency. Payments are held securely in smart contracts." },
                    { title: "Package Preparation", description: "Retailers prepare your package with a unique QR code, uploading metadata to the blockchain." },
                    { title: "Smart Delivery", description: "Our AI-powered SmartBox verifies the package, records the delivery, and securely stores your item." },
                    { title: "Secure Retrieval", description: "Use your RFID key to unlock the SmartBox and retrieve your package, automatically confirming delivery on the blockchain." }
                  ].map((step, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <span className="bg-primary text-background rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold mb-2">{step.title}</h3>
                        <p>{step.description}</p>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </div>
              <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/placeholder.svg?height=600&width=600"
                  alt="BOX3 SmartBox Illustration"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-t from-background to-foreground/5">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to Revolutionize Your Deliveries?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">Join the BOX3 network and experience the future of secure, decentralized package delivery.</p>
            <Link href="/login">
              <Button className="bg-primary text-background hover:bg-primarydark text-lg px-8 py-4">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 md:px-6 lg:px-8 bg-foreground/10">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 BOX3. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {icon}
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

