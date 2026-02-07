"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Download, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useDashboard, type Recipe } from "@/app/dashboard/providers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { RecipeModal } from "@/components/dashboard/RecipeModal"

type MealDbMeal = {
  idMeal: string
  strMeal: string
  strCategory: string | null
  strArea: string | null
  strInstructions: string | null
  strMealThumb: string | null
  strSource: string | null
  strYoutube: string | null
  [key: string]: unknown
}

function mealIngredients(meal: MealDbMeal) {
  const ingredients: NonNullable<Recipe["ingredients"]> = []
  for (let i = 1; i <= 20; i++) {
    const ing = (meal[`strIngredient${i}`] as string | null | undefined)?.trim()
    const meas = (meal[`strMeasure${i}`] as string | null | undefined)?.trim()
    if (!ing) continue
    ingredients.push({ item: ing, amount: meas || undefined })
  }
  return ingredients
}

function splitSteps(instructions: string | null) {
  if (!instructions) return []
  return instructions
    .split(/\r?\n/g)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function RecipesPage() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useDashboard()

  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [onlineQuery, setOnlineQuery] = useState("")
  const [onlineLoading, setOnlineLoading] = useState(false)
  const [onlineError, setOnlineError] = useState<string | null>(null)
  const [onlineResults, setOnlineResults] = useState<MealDbMeal[]>([])

  const categories = useMemo(() => {
    const uniq = new Set(recipes.map((r) => r.category).filter(Boolean))
    return Array.from(uniq).sort((a, b) => a.localeCompare(b))
  }, [recipes])

  const filteredRecipes = useMemo(() => {
    const q = query.trim().toLowerCase()
    return recipes.filter((r) => {
      if (category !== "all" && r.category !== category) return false
      if (!q) return true
      const haystack = `${r.title} ${r.description ?? ""} ${r.category} ${r.tags.join(" ")}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [category, query, recipes])

  const activeRecipe = useMemo(
    () => recipes.find((r) => r.id === activeRecipeId) ?? null,
    [activeRecipeId, recipes]
  )

  const openEdit = (id: string) => setEditingId(id)
  const closeEdit = () => setEditingId(null)

  const editingRecipe = useMemo(() => {
    if (!editingId) return null
    const r = recipes.find((x) => x.id === editingId)
    if (!r) return null
    return {
      title: r.title,
      description: r.description,
      category: r.category,
      tags: r.tags,
      ingredients: r.ingredients,
      steps: r.steps,
      sourceUrl: r.sourceUrl,
      imageUrl: r.imageUrl,
    }
  }, [editingId, recipes])

  const addInitial = useMemo(
    () => ({
      title: "",
      description: "",
      category: "General",
      tags: [],
      ingredients: [],
      steps: [],
      sourceUrl: "",
      imageUrl: "",
    }),
    []
  )

  const handleDelete = (id: string) => {
    const recipe = recipes.find((r) => r.id === id)
    const ok = window.confirm(`Delete recipe${recipe ? `: "${recipe.title}"` : ""}?`)
    if (!ok) return
    deleteRecipe(id)
    if (activeRecipeId === id) setActiveRecipeId(null)
  }

  const searchOnline = async () => {
    const q = onlineQuery.trim()
    if (!q) return
    setOnlineLoading(true)
    setOnlineError(null)
    setOnlineResults([])
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error(`Search failed (${res.status})`)
      const json = (await res.json()) as { meals: MealDbMeal[] | null }
      setOnlineResults(json.meals ?? [])
      if (!json.meals || json.meals.length === 0) setOnlineError("No recipes found.")
    } catch (e) {
      setOnlineError(e instanceof Error ? e.message : "Failed to fetch recipes.")
    } finally {
      setOnlineLoading(false)
    }
  }

  const saveMeal = (meal: MealDbMeal) => {
    addRecipe({
      title: meal.strMeal,
      description: meal.strArea ? `Cuisine: ${meal.strArea}` : undefined,
      category: meal.strCategory ?? "Imported",
      tags: [meal.strArea, meal.strCategory].filter(Boolean) as string[],
      ingredients: mealIngredients(meal),
      steps: splitSteps(meal.strInstructions),
      sourceUrl: meal.strSource ?? meal.strYoutube ?? undefined,
      imageUrl: meal.strMealThumb ?? undefined,
    })
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Recipes</h1>
        <p className="text-muted-foreground">
          Organize recipes by category and tags. Import ideas from free recipe search.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Your recipes
              </CardTitle>
              <Button size="sm" onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search recipes…"
                />
              </div>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {filteredRecipes.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No recipes yet. Add one or import below.
              </div>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-2">
                {filteredRecipes.map((r) => {
                  const isActive = r.id === activeRecipeId
                  return (
                    <div
                      key={r.id}
                      className={cn(
                        "rounded-lg border border-border p-3 bg-card hover:bg-accent/30 transition-colors cursor-pointer",
                        isActive && "border-primary/60 bg-accent/40"
                      )}
                      onClick={() => setActiveRecipeId(r.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setActiveRecipeId(r.id)
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-sm truncate">{r.title}</div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-accent/60 text-muted-foreground uppercase tracking-wide">
                              {r.category}
                            </span>
                          </div>
                          {r.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {r.tags.slice(0, 4).map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEdit(r.id)
                            }}
                            aria-label="Edit recipe"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(r.id)
                            }}
                            aria-label="Delete recipe"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recipe details</CardTitle>
            </CardHeader>
            <CardContent>
              {!activeRecipe ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Select a recipe to view it.
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-2xl font-bold tracking-tight">{activeRecipe.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {activeRecipe.category} • Updated{" "}
                        {new Date(activeRecipe.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openEdit(activeRecipe.id)}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </div>

                  {activeRecipe.description && (
                    <p className="text-sm text-muted-foreground">{activeRecipe.description}</p>
                  )}

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">Ingredients</div>
                      <ul className="space-y-1 text-sm">
                        {activeRecipe.ingredients.length === 0 ? (
                          <li className="text-muted-foreground">—</li>
                        ) : (
                          activeRecipe.ingredients.map((ing, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-muted-foreground shrink-0">
                                {ing.amount ? `${ing.amount}` : "•"}
                              </span>
                              <span className="min-w-0">{ing.item}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-semibold">Steps</div>
                      <ol className="space-y-2 text-sm list-decimal list-inside">
                        {activeRecipe.steps.length === 0 ? (
                          <li className="text-muted-foreground list-none">—</li>
                        ) : (
                          activeRecipe.steps.map((s, idx) => <li key={idx}>{s}</li>)
                        )}
                      </ol>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeRecipe.sourceUrl && (
                      <a
                        className="text-sm underline underline-offset-4"
                        href={activeRecipe.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Source
                      </a>
                    )}
                    {activeRecipe.imageUrl && (
                      <a
                        className="text-sm underline underline-offset-4"
                        href={activeRecipe.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Image
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">Find a recipe (free search)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Search and import from TheMealDB (free, no subscription).
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={onlineQuery}
                  onChange={(e) => setOnlineQuery(e.target.value)}
                  placeholder="Search by name…"
                />
                <Button onClick={searchOnline} disabled={onlineLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  {onlineLoading ? "Searching…" : "Search"}
                </Button>
              </div>

              {onlineError && (
                <div className="rounded-lg border border-border bg-accent/20 p-3 text-sm text-muted-foreground">
                  {onlineError}
                </div>
              )}

              {onlineResults.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {onlineResults.slice(0, 8).map((meal) => (
                    <div
                      key={meal.idMeal}
                      className="rounded-xl border border-border bg-card overflow-hidden"
                    >
                      {meal.strMealThumb && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={meal.strMealThumb}
                          alt={meal.strMeal}
                          className="h-32 w-full object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="p-4 space-y-3">
                        <div className="font-semibold leading-tight">{meal.strMeal}</div>
                        <div className="text-xs text-muted-foreground">
                          {(meal.strCategory ?? "Imported") +
                            (meal.strArea ? ` • ${meal.strArea}` : "")}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => saveMeal(meal)}
                        >
                          <Download className="h-4 w-4 mr-2" /> Save to my recipes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {isAddOpen && (
        <RecipeModal
          isOpen
          onClose={() => setIsAddOpen(false)}
          mode="add"
          initial={addInitial}
          onSave={(draft) => addRecipe(draft)}
        />
      )}

      {editingId && editingRecipe && (
        <RecipeModal
          isOpen
          onClose={closeEdit}
          mode="edit"
          initial={editingRecipe}
          onSave={(draft) => updateRecipe(editingId, draft)}
        />
      )}
    </div>
  )
}
