import { useState } from "react";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";
import { useCategories, useSubCategories, useCreateCategory, useUpdateCategory, useCreateSubCategory } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category, SubCategory, MakingChargeType } from "@/types/inventory";

export default function Categories() {
  const { data: categories, isLoading } = useCategories();
  const { data: allSubCategories } = useSubCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const createSubCategory = useCreateSubCategory();

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showSubCategoryDialog, setShowSubCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    code: "",
    hsn_code: "7113",
    default_making_charge_type: "per_gram" as MakingChargeType,
    default_making_charge_value: 0,
  });

  // Sub-category form state
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: "",
    code: "",
  });

  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        code: category.code,
        hsn_code: category.hsn_code || "7113",
        default_making_charge_type: category.default_making_charge_type,
        default_making_charge_value: category.default_making_charge_value,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: "",
        code: "",
        hsn_code: "7113",
        default_making_charge_type: "per_gram",
        default_making_charge_value: 0,
      });
    }
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = () => {
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, ...categoryForm });
    } else {
      createCategory.mutate(categoryForm);
    }
    setShowCategoryDialog(false);
  };

  const handleOpenSubCategoryDialog = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSubCategoryForm({ name: "", code: "" });
    setShowSubCategoryDialog(true);
  };

  const handleSaveSubCategory = () => {
    createSubCategory.mutate({
      category_id: selectedCategoryId,
      ...subCategoryForm,
    });
    setShowSubCategoryDialog(false);
  };

  const getSubCategoriesForCategory = (categoryId: string) => {
    return allSubCategories?.filter(sub => sub.category_id === categoryId) || [];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories and sub-categories
          </p>
        </div>
        <Button onClick={() => handleOpenCategoryDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories List */}
      <div className="grid gap-4">
        <Accordion type="multiple" className="space-y-4">
          {categories?.map((category) => {
            const subCategories = getSubCategoriesForCategory(category.id);
            return (
              <AccordionItem key={category.id} value={category.id} className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-4 text-left">
                    <FolderTree className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Code: {category.code} | HSN: {category.hsn_code}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {subCategories.length} sub-categories
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {/* Category Details */}
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Making Charge Type</p>
                          <p className="font-medium capitalize">{category.default_making_charge_type.replace("_", " ")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Default Value</p>
                          <p className="font-medium">{category.default_making_charge_value}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleOpenCategoryDialog(category)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>

                    {/* Sub-categories */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Sub-categories</h4>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenSubCategoryDialog(category.id)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      {subCategories.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No sub-categories yet</p>
                      ) : (
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                          {subCategories.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{sub.name}</p>
                                <p className="text-xs text-muted-foreground">Code: {sub.code}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update category details" : "Create a new product category"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Rings"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Category Code</Label>
              <Input
                id="code"
                value={categoryForm.code}
                onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g., RING"
                disabled={!!editingCategory}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hsn">HSN Code</Label>
              <Input
                id="hsn"
                value={categoryForm.hsn_code}
                onChange={(e) => setCategoryForm({ ...categoryForm, hsn_code: e.target.value })}
                placeholder="e.g., 7113"
              />
            </div>
            <div className="grid gap-2">
              <Label>Default Making Charge Type</Label>
              <Select
                value={categoryForm.default_making_charge_type}
                onValueChange={(value: MakingChargeType) =>
                  setCategoryForm({ ...categoryForm, default_making_charge_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_gram">Per Gram</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="flat">Flat Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="defaultValue">Default Making Charge Value</Label>
              <Input
                id="defaultValue"
                type="number"
                value={categoryForm.default_making_charge_value}
                onChange={(e) => setCategoryForm({ ...categoryForm, default_making_charge_value: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={!categoryForm.name || !categoryForm.code}>
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sub-category Dialog */}
      <Dialog open={showSubCategoryDialog} onOpenChange={setShowSubCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sub-category</DialogTitle>
            <DialogDescription>Create a new sub-category</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subName">Sub-category Name</Label>
              <Input
                id="subName"
                value={subCategoryForm.name}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                placeholder="e.g., Engagement Rings"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subCode">Sub-category Code</Label>
              <Input
                id="subCode"
                value={subCategoryForm.code}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g., ENG"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSubCategory} disabled={!subCategoryForm.name || !subCategoryForm.code}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
