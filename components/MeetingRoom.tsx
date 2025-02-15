"use client";
import { cn } from '@/lib/utils';
import { 
  CallControls, 
  CallingState, 
  CallParticipantsList, 
  CallStatsButton, 
  PaginatedGridLayout, 
  SpeakerLayout, 
  useCallStateHooks 
} from '@stream-io/video-react-sdk';

import React, { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LayoutList, Users } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation'; 
import EndCallButton from './EndCallButton';
import Loader from './Loader';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = ({ setIsSetupComplete }: { setIsSetupComplete: (value: boolean) => void }) => {
  const searchParams = useSearchParams();
  const router = useRouter();  // ✅ Moved to the top level
  const isPersonalRoom = !!searchParams.get('personal');
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  // Reset setup state when the call ends
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      setIsSetupComplete(false);
    }
  }, [callingState, setIsSetupComplete]);

  if (callingState !== CallingState.JOINED) return <Loader />;

  const RenderCallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      case 'speaker-left':
        return <SpeakerLayout participantsBarPosition="right" />;
      default:
        return <PaginatedGridLayout />;
    }
  };

  return (
    <section className='relative h-screen w-full overflow-hidden pt-4 text-white'>
      <div className="flex relative size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <RenderCallLayout />
        </div>

        {/* FIXED: Participants Sidebar Toggle */}
        <div className={cn(
          'h-[calc(100vh-86px)] ml-2 transition-all duration-300', 
          showParticipants ? 'block' : 'hidden'
        )}>
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      
      {/* Bottom Controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap">
        <CallControls onLeave={() => router.push('/')} />
        
        {/* Layout Selector */}
        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className='cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]'>
              <LayoutList size={20} className='text-white' />
            </DropdownMenuTrigger>
          </div>

          <DropdownMenuContent className='border-dark-1 bg-dark-1 text-white'>
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <DropdownMenuItem
                key={index}
                className='cursor-pointer'
                onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
              >
                {item}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className='border-dark-1' />
          </DropdownMenuContent>
        </DropdownMenu>

        <CallStatsButton />

        {/* FIXED: Participants Toggle Button */}
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className='text-white'/>
          </div>
        </button>

        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
