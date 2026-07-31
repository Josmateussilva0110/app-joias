import { SearchBar } from "@/components/ui/search-bar";

type CustomersSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CustomersSearch({ value, onChange }: CustomersSearchProps) {
  return (
    <SearchBar
      value={value}
      onChange={onChange}
      placeholder="Buscar por nome"
    />
  );
}
