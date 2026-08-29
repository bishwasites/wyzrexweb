import Image from "next/image";
import DataTable from "@/components/admin/DataTable";
import UploadField from "@/components/admin/UploadField";
import { TrashIcon } from "@/components/site/Icons";
import { addTrustedBrand, deleteTrustedBrand } from "@/lib/actions/trusted-brands";
import { getTrustedBrands } from "@/lib/queries";

export default async function TrustedBrandsPage() {
  const brands = await getTrustedBrands();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Trusted Brands</h1>

      <DataTable
        rows={brands}
        emptyMessage="No brands yet."
        columns={[
          {
            header: "Logo",
            render: (b) => (
              <div className="flex h-14 w-20 items-center justify-center rounded-control border border-line bg-bg p-2">
                <Image src={b.logoUrl} alt={b.name} width={80} height={32} unoptimized className="h-auto max-h-8 w-auto object-contain" />
              </div>
            ),
          },
          { header: "Name", render: (b) => b.name },
          { header: "Order", render: (b) => b.displayOrder },
          {
            header: "",
            render: (b) => (
              <form action={deleteTrustedBrand.bind(null, b.id)}>
                <button type="submit" aria-label="Delete" className="flex h-9 w-9 items-center justify-center rounded-control border border-line text-red-600 hover:border-red-400">
                  <TrashIcon />
                </button>
              </form>
            ),
          },
        ]}
      />

      <form action={addTrustedBrand} className="mt-8 grid max-w-xl grid-cols-1 gap-4 rounded-card-sm border border-dashed border-line p-6 sm:grid-cols-2">
        <h2 className="text-lg font-semibold sm:col-span-2">Add a brand</h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Name</label>
          <input name="name" required className="rounded-control border border-line bg-surface px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Website URL (optional)</label>
          <input name="websiteUrl" className="rounded-control border border-line bg-surface px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Display order</label>
          <input name="displayOrder" type="number" defaultValue={0} className="rounded-control border border-line bg-surface px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <UploadField name="logoUrl" label="Logo" />
        </div>
        <button type="submit" className="w-fit rounded-pill bg-gold px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] sm:col-span-2">
          Add brand
        </button>
      </form>
    </div>
  );
}
