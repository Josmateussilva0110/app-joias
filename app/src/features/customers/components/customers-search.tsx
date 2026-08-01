import { SearchBar } from "@/components/ui/search-bar";

type CustomersSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
};

export function CustomersSearch({
  value,
  onChange,
  onSubmit,
  placeholder = "Buscar por nome",
}: CustomersSearchProps) {
  return (
    <SearchBar
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
      placeholder={placeholder}
    />
  );
}
