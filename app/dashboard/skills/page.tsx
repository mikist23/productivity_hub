"use client"

import { useState, type SVGProps } from "react"
import { motion } from "framer-motion"
import { BookOpen, Code, Trophy, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/app/dashboard/providers"
import { AddSkillModal } from "@/components/dashboard/AddSkillModal"
import { SkillDetailsModal } from "@/components/dashboard/SkillDetailsModal"



export default function SkillsPage() {
  const { skills } = useDashboard()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeSkillRef, setActiveSkillRef] = useState<{ categoryId: string; skillId: string } | null>(null)

  const currentSkillData = (() => {
    for (const category of skills) {
      const skill = category.items.find(s => s.status === "learning")
      if (skill) return { category, skill }
    }
    return null
  })()

  const activeSkillData = (() => {
    if (!activeSkillRef) return null
    const category = skills.find(c => c.id === activeSkillRef.categoryId)
    const skill = category?.items.find(s => s.id === activeSkillRef.skillId)
    if (!category || !skill) return null
    return { category, skill }
  })()

  const currentSkill = currentSkillData?.skill ?? {
    name: "Nothing right now",
    progress: 0,
    level: "Start learning!",
  }

  return (
    <div className="space-y-8">
      <AddSkillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {activeSkillData && (
        <SkillDetailsModal
          isOpen={activeSkillRef !== null}
          onClose={() => setActiveSkillRef(null)}
          categoryId={activeSkillData.category.id}
          categoryName={activeSkillData.category.category}
          skill={activeSkillData.skill}
        />
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Skills Development</h1>
            <p className="text-muted-foreground">Track your learning journey and mastery</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add Skill
        </Button>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Active Learning Path */}
        <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Current Focus
            </h2>
            <Card className="bg-primary text-primary-foreground border-none">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Currently Learning</span>
                            <h3 className="text-2xl font-bold mt-1">{currentSkill.name}</h3>
                        </div>
                        <Code className="h-8 w-8 opacity-50" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{currentSkill.progress}%</span>
                        </div>
                        <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary-foreground transition-all duration-1000" 
                                style={{ width: `${currentSkill.progress}%` }}
                            />
                        </div>
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full mt-6"
                      onClick={() => {
                        if (currentSkillData) {
                          setActiveSkillRef({
                            categoryId: currentSkillData.category.id,
                            skillId: currentSkillData.skill.id,
                          })
                        } else {
                          setIsModalOpen(true)
                        }
                      }}
                    >
                        Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Up Next</h3>
                {skills.flatMap(c => c.items)
                  .filter(s => s.status === 'learning' && s.id !== currentSkillData?.skill.id)
                  .slice(0, 2)
                  .map((skill) => {
                    const category = skills.find(c => c.items.some(item => item.id === skill.id))
                    return (
                    <Card
                      key={skill.id}
                      className="hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (!category) return
                        setActiveSkillRef({ categoryId: category.id, skillId: skill.id })
                      }}
                    >
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                                <Code className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <h4 className="font-semibold">{skill.name}</h4>
                                <p className="text-xs text-muted-foreground">{skill.level}</p>
                            </div>
                        </CardContent>
                    </Card>
                  )
                })}
            </div>
        </div>

        {/* Skill Tree / Matrix */}
        <div className="space-y-6">
             <h2 className="text-xl font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5" /> Mastery & Progress
            </h2>
            <div className="space-y-6">
                {skills.map((category, idx) => (
                    <motion.div 
                        key={category.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <h3 className="mb-3 font-medium text-sm text-muted-foreground">{category.category}</h3>
                        <div className="grid gap-3">
                            {category.items.map((skill) => (
                                <div
                                  key={skill.id}
                                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors cursor-pointer"
                                  onClick={() =>
                                    setActiveSkillRef({ categoryId: category.id, skillId: skill.id })
                                  }
                                >
                                    <div className={cn("h-2 w-2 rounded-full",
                                        skill.status === "mastered" && "bg-green-500",
                                        skill.status === "inprogress" && "bg-amber-500",
                                        skill.status === "learning" && "bg-blue-500",
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium text-sm">{skill.name}</span>
                                            <span className="text-xs text-muted-foreground">{skill.level}</span>
                                        </div>
                                        <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                                            <div 
                                                className={cn("h-full rounded-full transition-all duration-500",
                                                     skill.status === "mastered" && "bg-green-500",
                                                     skill.status === "inprogress" && "bg-amber-500",
                                                     skill.status === "learning" && "bg-blue-500",
                                                )} 
                                                style={{ width: `${skill.progress}%` }} 
                                            />
                                        </div>
                                    </div>
                                    {skill.progress >= 90 && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
