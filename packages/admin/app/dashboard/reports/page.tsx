import ReportsTable from '@/components/ReportsTable';

export default function ReportsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#232D4B]">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and moderate all submitted reports</p>
      </div>
      <ReportsTable />
    </div>
  );
}
