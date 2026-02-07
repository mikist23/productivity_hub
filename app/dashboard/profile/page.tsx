"use client"

import { useState, useEffect } from "react"
import { useDashboard } from "@/app/dashboard/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Save, User } from "lucide-react"

export default function ProfilePage() {
  const { userProfile, updateUserProfile } = useDashboard()
  const [formData, setFormData] = useState(userProfile)
  const [isSaved, setIsSaved] = useState(false)

  // Sync with context if it changes externally (initial load)
  useEffect(() => {
    setFormData(userProfile)
  }, [userProfile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setIsSaved(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUserProfile(formData)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 border-b border-border pb-6"
      >
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and bio</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
            <CardHeader>
                <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input 
                            id="name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            placeholder="Your name"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="role">Current Role / Title</Label>
                        <Input 
                            id="role" 
                            name="role" 
                            value={formData.role} 
                            onChange={handleChange} 
                            placeholder="e.g. Frontend Developer"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio / Goal Statement</Label>
                        <Textarea 
                            id="bio" 
                            name="bio" 
                            value={formData.bio} 
                            onChange={handleChange} 
                            placeholder="Tell us a bit about your goals..."
                            rows={4}
                        />
                         <p className="text-xs text-muted-foreground">
                            This will be displayed on your main dashboard card.
                        </p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="min-w-[120px]">
                            {isSaved ? (
                                <span className="flex items-center gap-2">
                                    Saved!
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="h-4 w-4" /> Save Changes
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
