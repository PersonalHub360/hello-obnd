import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { useQuery } from "@tanstack/react-query";
import type { Staff } from "@shared/schema";

interface StaffComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  testId?: string;
}

export function StaffCombobox({
  value,
  onChange,
  placeholder = "Select staff...",
  testId,
}: StaffComboboxProps) {
  const [open, setOpen] = useState(false);

  const { data: staff = [], isLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const selectedStaff = staff.find((s) => s.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11"
          data-testid={testId}
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Type to search staff..."
              className="h-11"
            />
          </div>
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading staff..." : "No staff found."}
            </CommandEmpty>
            <CommandGroup>
              {staff.map((staffMember) => (
                <CommandItem
                  key={staffMember.id}
                  value={staffMember.name}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  data-testid={`option-staff-${staffMember.id}`}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === staffMember.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{staffMember.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {staffMember.role} • {staffMember.brand}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
