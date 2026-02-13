"use client"

import { useState } from "react"
import {
  useDashboard,
  type JobStatus,
  type JobWorkMode,
  type JobEmploymentType,
} from "@/app/dashboard/providers"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { jobCategories, jobSourceProviders } from "@/lib/jobs/discovery-config"
import { AuthPromptModal } from "@/components/dashboard/AuthPromptModal"
import { useGuardedAction } from "@/components/dashboard/useGuardedAction"

interface AddJobModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddJobModal({ isOpen, onClose }: AddJobModalProps) {
  const { addJob } = useDashboard()
  const { guard, authPrompt } = useGuardedAction("/dashboard/jobs")
  const [role, setRole] = useState("")
  const [company, setCompany] = useState("")
  const [location, setLocation] = useState("")
  const [status, setStatus] = useState<JobStatus>("applied")
  const [category, setCategory] = useState("")
  const [workMode, setWorkMode] = useState<JobWorkMode | "">("remote")
  const [employmentType, setEmploymentType] = useState<JobEmploymentType | "">("full-time")
  const [source, setSource] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [salaryRange, setSalaryRange] = useState("")
  const [nextAction, setNextAction] = useState("")
  const [nextActionDate, setNextActionDate] = useState("")
  const [notes, setNotes] = useState("")
  const [formError, setFormError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    const trimmedSourceUrl = sourceUrl.trim()
    if (trimmedSourceUrl.length > 0) {
      try {
        const parsed = new URL(trimmedSourceUrl)
        if (!parsed.protocol.startsWith("http")) {
          setFormError("Source URL must start with http or https.")
          return
        }
      } catch {
        setFormError("Please enter a valid source URL.")
        return
      }
    }

    const generatedLogo = company.trim().slice(0, 2).toUpperCase()

    guard("add job applications", () => {
      addJob({
        role: role.trim(),
        company: company.trim(),
        location: location.trim(),
        status,
        logo: generatedLogo,
        category: category.trim() || undefined,
        workMode: workMode || undefined,
        employmentType: employmentType || undefined,
        source: source.trim() || undefined,
        sourceUrl: trimmedSourceUrl || undefined,
        salaryRange: salaryRange.trim() || undefined,
        nextAction: nextAction.trim() || undefined,
        nextActionDate: nextActionDate || undefined,
        notes: notes.trim() || undefined,
      })

      // Reset
      setRole("")
      setCompany("")
      setLocation("")
      setStatus("applied")
      setCategory("")
      setWorkMode("remote")
      setEmploymentType("full-time")
      setSource("")
      setSourceUrl("")
      setSalaryRange("")
      setNextAction("")
      setNextActionDate("")
      setNotes("")
      setFormError("")
      onClose()
    })
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
              placeholder="e.g. Remote, New York"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Choose category</option>
              {jobCategories.map((item) => (
                <option key={item.id} value={item.label}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="work-mode">Work Mode</Label>
            <Select
              id="work-mode"
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value as JobWorkMode)}
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="employment-type">Employment Type</Label>
            <Select
              id="employment-type"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as JobEmploymentType)}
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select id="source" value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="">Choose source</option>
              {jobSourceProviders.map((item) => (
                <option key={item.id} value={item.label}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary-range">Salary Range</Label>
            <Input
              id="salary-range"
              placeholder="e.g. $80k - $100k"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="source-url">Application URL (optional)</Label>
          <Input
            id="source-url"
            type="url"
            placeholder="https://www.linkedin.com/jobs/view/..."
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="next-action">Next Action</Label>
            <Input
              id="next-action"
              placeholder="e.g. Send follow-up email"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="next-action-date">Next Action Date</Label>
            <Input
              id="next-action-date"
              type="date"
              value={nextActionDate}
              onChange={(e) => setNextActionDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add notes about recruiter messages, interview prep, and reminders."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[96px]"
          />
        </div>

        {formError && (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Track Application</Button>
        </div>
        <AuthPromptModal
          isOpen={authPrompt.isOpen}
          onClose={authPrompt.closePrompt}
          action={authPrompt.action}
          nextPath={authPrompt.nextPath}
        />
      </form>
    </Modal>
  )
}
