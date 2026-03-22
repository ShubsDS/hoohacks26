import BroadcastForm from '@/components/BroadcastForm';

export default function BroadcastPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#232D4B]">Broadcast Alert</h1>
        <p className="text-sm text-gray-500 mt-0.5">Send a push notification to all users on campus</p>
      </div>
      <BroadcastForm />
    </div>
  );
}
