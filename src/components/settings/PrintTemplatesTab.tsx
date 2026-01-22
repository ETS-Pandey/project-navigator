import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Receipt, ScrollText, Tag, Loader2, Settings2, Save } from "lucide-react";
import { usePrintTemplates, useUpdatePrintTemplate } from "@/hooks/useSettings";
import { PrintTemplate } from "@/types/settings";

const templateTypeIcons: Record<string, React.ReactNode> = {
  invoice: <FileText className="h-5 w-5" />,
  quotation: <ScrollText className="h-5 w-5" />,
  loan_agreement: <ScrollText className="h-5 w-5" />,
  receipt: <Receipt className="h-5 w-5" />,
  label: <Tag className="h-5 w-5" />,
};

const templateTypeLabels: Record<string, string> = {
  invoice: "Invoice",
  quotation: "Quotation",
  loan_agreement: "Loan Agreement",
  receipt: "Receipt",
  label: "Product Label",
};

export function PrintTemplatesTab() {
  const { data: templates, isLoading } = usePrintTemplates();
  const updateTemplate = useUpdatePrintTemplate();
  const [editingTemplate, setEditingTemplate] = useState<PrintTemplate | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<PrintTemplate>>({});

  const handleEdit = (template: PrintTemplate) => {
    setEditingTemplate(template);
    setEditedValues({
      header_content: { ...template.header_content },
      footer_content: { ...template.footer_content },
      body_settings: { ...template.body_settings },
      page_settings: { ...template.page_settings },
    });
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    
    await updateTemplate.mutateAsync({
      id: editingTemplate.id,
      ...editedValues,
    });
    setEditingTemplate(null);
    setEditedValues({});
  };

  const updateHeader = (key: string, value: unknown) => {
    setEditedValues(prev => ({
      ...prev,
      header_content: { ...prev.header_content, [key]: value },
    }));
  };

  const updateFooter = (key: string, value: unknown) => {
    setEditedValues(prev => ({
      ...prev,
      footer_content: { ...prev.footer_content, [key]: value },
    }));
  };

  const updateBody = (key: string, value: unknown) => {
    setEditedValues(prev => ({
      ...prev,
      body_settings: { ...prev.body_settings, [key]: value },
    }));
  };

  const updatePage = (key: string, value: unknown) => {
    setEditedValues(prev => ({
      ...prev,
      page_settings: { ...prev.page_settings, [key]: value },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const groupedTemplates = templates?.reduce((acc, template) => {
    if (!acc[template.template_type]) {
      acc[template.template_type] = [];
    }
    acc[template.template_type].push(template);
    return acc;
  }, {} as Record<string, PrintTemplate[]>) || {};

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Print Templates</h3>
        <p className="text-sm text-muted-foreground">
          Customize how your invoices, receipts, and labels are printed
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(groupedTemplates).map(([type, typeTemplates]) => (
          <Card key={type}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {templateTypeIcons[type]}
                  <CardTitle className="text-base">{templateTypeLabels[type]}</CardTitle>
                </div>
                <Badge variant="outline">{typeTemplates.length} template(s)</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {typeTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">{template.template_name}</div>
                    {template.is_default && (
                      <Badge variant="secondary" className="mt-1">Default</Badge>
                    )}
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Edit {template.template_name}</SheetTitle>
                        <SheetDescription>
                          Customize the {templateTypeLabels[template.template_type]} template
                        </SheetDescription>
                      </SheetHeader>
                      
                      {editingTemplate?.id === template.id && (
                        <div className="mt-6">
                          <Tabs defaultValue="header" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="header">Header</TabsTrigger>
                              <TabsTrigger value="body">Body</TabsTrigger>
                              <TabsTrigger value="footer">Footer</TabsTrigger>
                              <TabsTrigger value="page">Page</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="header" className="space-y-4 mt-4">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="showLogo">Show Logo</Label>
                                <Switch
                                  id="showLogo"
                                  checked={editedValues.header_content?.showLogo ?? true}
                                  onCheckedChange={(v) => updateHeader("showLogo", v)}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="showCompanyName">Show Company Name</Label>
                                <Switch
                                  id="showCompanyName"
                                  checked={editedValues.header_content?.showCompanyName ?? true}
                                  onCheckedChange={(v) => updateHeader("showCompanyName", v)}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="showAddress">Show Address</Label>
                                <Switch
                                  id="showAddress"
                                  checked={editedValues.header_content?.showAddress ?? true}
                                  onCheckedChange={(v) => updateHeader("showAddress", v)}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="showGSTIN">Show GSTIN</Label>
                                <Switch
                                  id="showGSTIN"
                                  checked={editedValues.header_content?.showGSTIN ?? true}
                                  onCheckedChange={(v) => updateHeader("showGSTIN", v)}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="showPhone">Show Phone</Label>
                                <Switch
                                  id="showPhone"
                                  checked={editedValues.header_content?.showPhone ?? true}
                                  onCheckedChange={(v) => updateHeader("showPhone", v)}
                                />
                              </div>
                              {type === "label" && (
                                <div className="space-y-2">
                                  <Label htmlFor="shopName">Shop Name on Labels</Label>
                                  <Input
                                    id="shopName"
                                    value={editedValues.header_content?.shopName || "JewelPro"}
                                    onChange={(e) => updateHeader("shopName", e.target.value)}
                                  />
                                </div>
                              )}
                              <div className="space-y-2">
                                <Label htmlFor="logoPosition">Logo Position</Label>
                                <Select
                                  value={editedValues.header_content?.logoPosition || "left"}
                                  onValueChange={(v) => updateHeader("logoPosition", v)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="body" className="space-y-4 mt-4">
                              {(type === "invoice" || type === "quotation") && (
                                <>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="showItemCode">Show Item Code</Label>
                                    <Switch
                                      id="showItemCode"
                                      checked={editedValues.body_settings?.showItemCode ?? true}
                                      onCheckedChange={(v) => updateBody("showItemCode", v)}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="showHSN">Show HSN Code</Label>
                                    <Switch
                                      id="showHSN"
                                      checked={editedValues.body_settings?.showHSN ?? true}
                                      onCheckedChange={(v) => updateBody("showHSN", v)}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="showWeight">Show Weight</Label>
                                    <Switch
                                      id="showWeight"
                                      checked={editedValues.body_settings?.showWeight ?? true}
                                      onCheckedChange={(v) => updateBody("showWeight", v)}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="showPurity">Show Purity</Label>
                                    <Switch
                                      id="showPurity"
                                      checked={editedValues.body_settings?.showPurity ?? true}
                                      onCheckedChange={(v) => updateBody("showPurity", v)}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="showMakingCharges">Show Making Charges</Label>
                                    <Switch
                                      id="showMakingCharges"
                                      checked={editedValues.body_settings?.showMakingCharges ?? true}
                                      onCheckedChange={(v) => updateBody("showMakingCharges", v)}
                                    />
                                  </div>
                                  {type === "invoice" && (
                                    <div className="flex items-center justify-between">
                                      <Label htmlFor="showTax">Show Tax Details</Label>
                                      <Switch
                                        id="showTax"
                                        checked={editedValues.body_settings?.showTax ?? true}
                                        onCheckedChange={(v) => updateBody("showTax", v)}
                                      />
                                    </div>
                                  )}
                                </>
                              )}
                              {type === "label" && (
                                <>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="showBarcode">Show Barcode</Label>
                                    <Switch
                                      id="showBarcode"
                                      checked={editedValues.body_settings?.showBarcode ?? true}
                                      onCheckedChange={(v) => updateBody("showBarcode", v)}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="showQR">Show QR Code</Label>
                                    <Switch
                                      id="showQR"
                                      checked={editedValues.body_settings?.showQR ?? false}
                                      onCheckedChange={(v) => updateBody("showQR", v)}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="showPrice">Show Price</Label>
                                    <Switch
                                      id="showPrice"
                                      checked={editedValues.body_settings?.showPrice ?? true}
                                      onCheckedChange={(v) => updateBody("showPrice", v)}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="showHUID">Show HUID</Label>
                                    <Switch
                                      id="showHUID"
                                      checked={editedValues.body_settings?.showHUID ?? true}
                                      onCheckedChange={(v) => updateBody("showHUID", v)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="labelSize">Label Size</Label>
                                    <Select
                                      value={editedValues.body_settings?.labelSize || "medium"}
                                      onValueChange={(v) => updateBody("labelSize", v)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="small">Small (50mm x 25mm)</SelectItem>
                                        <SelectItem value="medium">Medium (70mm x 40mm)</SelectItem>
                                        <SelectItem value="large">Large (100mm x 60mm)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="footer" className="space-y-4 mt-4">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="showTerms">Show Terms & Conditions</Label>
                                <Switch
                                  id="showTerms"
                                  checked={editedValues.footer_content?.showTerms ?? true}
                                  onCheckedChange={(v) => updateFooter("showTerms", v)}
                                />
                              </div>
                              {editedValues.footer_content?.showTerms && (
                                <div className="space-y-2">
                                  <Label htmlFor="termsText">Terms Text</Label>
                                  <Textarea
                                    id="termsText"
                                    value={editedValues.footer_content?.termsText || ""}
                                    onChange={(e) => updateFooter("termsText", e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              )}
                              {type === "invoice" && (
                                <>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="showBankDetails">Show Bank Details</Label>
                                    <Switch
                                      id="showBankDetails"
                                      checked={editedValues.footer_content?.showBankDetails ?? true}
                                      onCheckedChange={(v) => updateFooter("showBankDetails", v)}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="showSignature">Show Signature Line</Label>
                                    <Switch
                                      id="showSignature"
                                      checked={editedValues.footer_content?.showSignature ?? true}
                                      onCheckedChange={(v) => updateFooter("showSignature", v)}
                                    />
                                  </div>
                                </>
                              )}
                              {type === "loan_agreement" && (
                                <>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="showWitness">Show Witness Signature</Label>
                                    <Switch
                                      id="showWitness"
                                      checked={editedValues.footer_content?.showWitness ?? true}
                                      onCheckedChange={(v) => updateFooter("showWitness", v)}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="showBorrowerSignature">Show Borrower Signature</Label>
                                    <Switch
                                      id="showBorrowerSignature"
                                      checked={editedValues.footer_content?.showBorrowerSignature ?? true}
                                      onCheckedChange={(v) => updateFooter("showBorrowerSignature", v)}
                                    />
                                  </div>
                                </>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="page" className="space-y-4 mt-4">
                              <div className="space-y-2">
                                <Label htmlFor="pageSize">Page Size</Label>
                                <Select
                                  value={editedValues.page_settings?.pageSize || "A4"}
                                  onValueChange={(v) => updatePage("pageSize", v)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A4">A4</SelectItem>
                                    <SelectItem value="A5">A5</SelectItem>
                                    <SelectItem value="Letter">Letter</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="orientation">Orientation</Label>
                                <Select
                                  value={editedValues.page_settings?.orientation || "portrait"}
                                  onValueChange={(v) => updatePage("orientation", v)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="portrait">Portrait</SelectItem>
                                    <SelectItem value="landscape">Landscape</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="marginTop">Top Margin (mm)</Label>
                                  <Input
                                    id="marginTop"
                                    type="number"
                                    value={editedValues.page_settings?.marginTop || 10}
                                    onChange={(e) => updatePage("marginTop", parseInt(e.target.value))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="marginBottom">Bottom Margin (mm)</Label>
                                  <Input
                                    id="marginBottom"
                                    type="number"
                                    value={editedValues.page_settings?.marginBottom || 10}
                                    onChange={(e) => updatePage("marginBottom", parseInt(e.target.value))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="marginLeft">Left Margin (mm)</Label>
                                  <Input
                                    id="marginLeft"
                                    type="number"
                                    value={editedValues.page_settings?.marginLeft || 10}
                                    onChange={(e) => updatePage("marginLeft", parseInt(e.target.value))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="marginRight">Right Margin (mm)</Label>
                                  <Input
                                    id="marginRight"
                                    type="number"
                                    value={editedValues.page_settings?.marginRight || 10}
                                    onChange={(e) => updatePage("marginRight", parseInt(e.target.value))}
                                  />
                                </div>
                              </div>
                              {type === "label" && (
                                <>
                                  <div className="space-y-2">
                                    <Label htmlFor="columns">Columns per Row</Label>
                                    <Input
                                      id="columns"
                                      type="number"
                                      min={1}
                                      max={6}
                                      value={editedValues.page_settings?.columns || 3}
                                      onChange={(e) => updatePage("columns", parseInt(e.target.value))}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="labelsPerProduct">Labels per Product</Label>
                                    <Input
                                      id="labelsPerProduct"
                                      type="number"
                                      min={1}
                                      max={10}
                                      value={editedValues.page_settings?.labelsPerProduct || 1}
                                      onChange={(e) => updatePage("labelsPerProduct", parseInt(e.target.value))}
                                    />
                                  </div>
                                </>
                              )}
                            </TabsContent>
                          </Tabs>
                          
                          <div className="mt-6 flex justify-end">
                            <Button onClick={handleSave} disabled={updateTemplate.isPending}>
                              {updateTemplate.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              <Save className="mr-2 h-4 w-4" />
                              Save Template
                            </Button>
                          </div>
                        </div>
                      )}
                    </SheetContent>
                  </Sheet>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {(!templates || templates.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Templates</h3>
            <p className="text-sm text-muted-foreground">
              Print templates will appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
