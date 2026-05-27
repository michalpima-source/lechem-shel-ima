'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, ImagePlus } from 'lucide-react'
import { createProduct, updateProduct, deleteProduct } from '@/lib/actions/products'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Product, ProductCategory } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  category: 'חלות' as ProductCategory,
  is_available: true,
}

export function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [uploadPreview, setUploadPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setUploadPreview('')
    setDialogOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setForm({
      name: product.name,
      description: product.description ?? '',
      price: String(product.price),
      image_url: product.image_url ?? '',
      category: product.category,
      is_available: product.is_available,
    })
    setUploadPreview(product.image_url ?? '')
    setDialogOpen(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filename, file, { cacheControl: '3600', upsert: false })

    if (error) {
      toast.error('שגיאה בהעלאת התמונה: ' + error.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path)

    setForm(f => ({ ...f, image_url: publicUrl }))
    setUploadPreview(publicUrl)
    setUploading(false)
    toast.success('התמונה הועלתה!')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = parseFloat(form.price)
    if (isNaN(price) || price <= 0) {
      toast.error('מחיר לא תקין')
      return
    }

    startTransition(async () => {
      const payload = {
        name: form.name,
        description: form.description,
        price,
        image_url: form.image_url,
        category: form.category,
        is_available: form.is_available,
      }

      if (editing) {
        const result = await updateProduct(editing.id, payload)
        if (!result.success) { toast.error(result.error); return }
        setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...payload } : p))
        toast.success('המוצר עודכן!')
      } else {
        const result = await createProduct(payload)
        if (!result.success) { toast.error(result.error); return }
        toast.success('המוצר נוסף!')
        // Reload the page to get the new product with its ID
        window.location.reload()
        return
      }

      setDialogOpen(false)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteProduct(id)
      if (!result.success) { toast.error(result.error); return }
      setProducts(prev => prev.filter(p => p.id !== id))
      setDeleteId(null)
      toast.success('המוצר נמחק')
    })
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          הוסף מוצר
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">תמונה</TableHead>
                <TableHead>שם</TableHead>
                <TableHead>קטגוריה</TableHead>
                <TableHead>מחיר</TableHead>
                <TableHead>זמינות</TableHead>
                <TableHead className="w-24">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    אין מוצרים עדיין
                  </TableCell>
                </TableRow>
              ) : (
                products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-lg">🍞</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">₪{product.price.toFixed(0)}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => {
                          startTransition(async () => {
                            const result = await updateProduct(product.id, { is_available: !product.is_available })
                            if (result.success) {
                              setProducts(prev => prev.map(p =>
                                p.id === product.id ? { ...p, is_available: !p.is_available } : p
                              ))
                            }
                          })
                        }}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          product.is_available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {product.is_available ? 'זמין' : 'לא זמין'}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'עריכת מוצר' : 'הוספת מוצר חדש'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם המוצר *</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">מחיר (₪) *</Label>
                <Input id="price" name="price" type="number" min="0" step="0.5" value={form.price} onChange={handleChange} required dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">קטגוריה</Label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm bg-background"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>תמונה</Label>
              <div className="flex gap-3 items-start">
                {uploadPreview && (
                  <div className="relative w-20 h-20 rounded overflow-hidden bg-muted shrink-0">
                    <Image src={uploadPreview} alt="תצוגה מקדימה" fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer border rounded px-3 py-2 text-sm hover:bg-muted/50 transition-colors w-full">
                    <ImagePlus className="h-4 w-4 shrink-0" />
                    {uploading ? 'מעלה...' : 'העלה תמונה'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                  <Input
                    name="image_url"
                    value={form.image_url}
                    onChange={e => {
                      handleChange(e)
                      setUploadPreview(e.target.value)
                    }}
                    placeholder="או הכנס URL תמונה..."
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is_available"
                checked={form.is_available}
                onCheckedChange={checked => setForm(f => ({ ...f, is_available: !!checked }))}
              />
              <Label htmlFor="is_available" className="cursor-pointer">מוצר זמין להזמנה</Label>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                ביטול
              </Button>
              <Button type="submit" disabled={isPending || uploading}>
                {isPending ? 'שומר...' : editing ? 'שמור שינויים' : 'הוסף מוצר'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת מוצר</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו אינה הפיכה. המוצר יימחק לצמיתות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
