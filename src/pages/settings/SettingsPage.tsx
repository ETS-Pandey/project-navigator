import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, FileText, Settings, Download, FileDown } from "lucide-react";
import { BusinessConfigTab } from "@/components/settings/BusinessConfigTab";
import { BranchManagementTab } from "@/components/settings/BranchManagementTab";
import { PrintTemplatesTab } from "@/components/settings/PrintTemplatesTab";
import { DataImportExportTab } from "@/components/settings/DataImportExportTab";
import { ReportsDownloadTab } from "@/components/settings/ReportsDownloadTab";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your business configuration, branches, data, and reports
        </p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full max-w-[900px] grid-cols-5">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
          <TabsTrigger value="branches" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Branches</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Import/Export</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <BusinessConfigTab />
        </TabsContent>

        <TabsContent value="branches">
          <BranchManagementTab />
        </TabsContent>

        <TabsContent value="templates">
          <PrintTemplatesTab />
        </TabsContent>

        <TabsContent value="data">
          <DataImportExportTab />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsDownloadTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
