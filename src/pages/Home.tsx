import { ClassroomScene } from '@/components/classroom/ClassroomScene';
import { ControlPanel } from '@/components/ControlPanel';
import { InfoPanel } from '@/components/InfoPanel';

export default function Home() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0D1B2A]">
      <ControlPanel />
      <div className="flex-1 relative">
        <ClassroomScene />
        <InfoPanel />
      </div>
    </div>
  );
}
