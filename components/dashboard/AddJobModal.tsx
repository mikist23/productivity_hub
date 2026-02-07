"use client"

import { useState } from "react"
import { useDashboard, type JobStatus } from "@/app/dashboard/providers"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface AddJobModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddJobModal({ isOpen, onClose }: AddJobModalProps) {
  const { addJob } = useDashboard()
  const [role, setRole] = useState("")
  const [company, setCompany] = useState("")
  const [location, setLocation] = useState("")
  const [status, setStatus] = useState<JobStatus>("applied")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const generatedLogo = company.trim().slice(0, 2).toUpperCase()
    
    addJob({
        role,
        company,
        location,
        status,
        logo: generatedLogo
    })
    
    // Reset
    setRole("")
    setCompany("")
    setLocation("")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Track Application"
      description="Add a new job application to your tracking board."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role / Title</Label>
          <Input 
            id="role" 
            placeholder="e.g. Senior Frontend Engineer" 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input 
                    id="company" 
                    placeholder="e.g. Google" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                 <Label htmlFor="location">Location</Label>
                <Input 
                    id="location" 
                    placeholder="e.g. Remote, NY" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                />
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="status">Current Status</Label>
            <Select 
                id="status" 
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
            >
                <option value="applied">Applied</option>
                <option value="interview">Interviewing</option>
                <option value="offer">Offer Received</option>
                <option value="rejected">Rejected</option>
            </Select>
        </div>

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Track Application</Button>
        </div>
      </form>
    </Modal>
  )
}
