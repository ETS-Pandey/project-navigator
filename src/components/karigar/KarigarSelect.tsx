import { useKarigars } from "@/hooks/useKarigars";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KarigarSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function KarigarSelect({
  value,
  onValueChange,
  placeholder = "Select Karigar",
  disabled,
}: KarigarSelectProps) {
  const { data: karigars, isLoading } = useKarigars();

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">None</SelectItem>
        {karigars?.filter(k => k.is_active).map((karigar) => (
          <SelectItem key={karigar.id} value={karigar.id}>
            {karigar.name} ({karigar.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
