
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Supplier } from "../types";

interface SuppliersListProps {
  suppliers: Supplier[] | undefined;
}

export function SuppliersList({ suppliers }: SuppliersListProps) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Fornecedores</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome Fantasia</TableHead>
            <TableHead>Razão Social</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Endereço</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers?.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell>{supplier.name}</TableCell>
              <TableCell>{supplier.company_name || "-"}</TableCell>
              <TableCell>{supplier.cnpj || "-"}</TableCell>
              <TableCell>{supplier.email}</TableCell>
              <TableCell>{supplier.phone}</TableCell>
              <TableCell>{supplier.address}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
