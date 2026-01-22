import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCustomers, useCreateCustomer } from "@/hooks/useCustomers";
import { CustomerForm } from "./CustomerForm";
import type { Customer, CustomerFormData } from "@/types/billing";

interface CustomerSelectProps {
  value?: string;
  onSelect: (customer: Customer | null) => void;
  disabled?: boolean;
}

export function CustomerSelect({ value, onSelect, disabled }: CustomerSelectProps) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const { data: customers = [], isLoading } = useCustomers({ 
    search: search || undefined,
    isActive: true 
  });
  const createCustomer = useCreateCustomer();
  
  const selectedCustomer = customers.find((c) => c.id === value);
  
  const handleCreateCustomer = async (data: CustomerFormData) => {
    const customer = await createCustomer.mutateAsync(data);
    onSelect(customer as Customer);
    setDialogOpen(false);
    setOpen(false);
  };
  
  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedCustomer ? (
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {selectedCustomer.name}
                {selectedCustomer.phone && (
                  <span className="text-muted-foreground">
                    ({selectedCustomer.phone})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">Select customer...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search by name or phone..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading..." : "No customer found."}
              </CommandEmpty>
              <CommandGroup>
                {customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.id}
                    onSelect={() => {
                      onSelect(customer);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === customer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{customer.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {customer.phone} • {customer.customer_code}
                        {customer.customer_type !== "retail" && (
                          <span className="ml-2 capitalize">
                            ({customer.customer_type})
                          </span>
                        )}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" disabled={disabled}>
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm 
            onSubmit={handleCreateCustomer}
            isLoading={createCustomer.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSelect(null)}
          disabled={disabled}
        >
          ×
        </Button>
      )}
    </div>
  );
}
