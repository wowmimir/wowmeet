'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import HomeCard from './HomeCard';
import MeetingModal from './MeetingModal';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
import Loader from './Loader';
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';

const initialValues = {
    dateTime: new Date(),
    description: '',
    link: '',
};

const MeetingTypeList = () => {
    const router = useRouter();
    const [meetingState, setMeetingState] = useState<
        'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined
    >(undefined);
    const [values, setValues] = useState(initialValues);
    const [callDetail, setCallDetail] = useState<Call>();
    const client = useStreamVideoClient();
    const { user } = useUser();
    const { toast } = useToast();

    const createMeeting = async () => {
        if (!client || !user) return;

        try {
            const id = crypto.randomUUID();
            const call = client.call("default", id);
            if (!call) throw new Error("Failed to create call");

            if (meetingState === "isInstantMeeting") {
                await call.getOrCreate();
                router.push(`/meeting/${call.id}`);
                return;
            }

            if (!values.dateTime) {
                toast({ title: "Please select a valid time" });
                return;
            }

            const startsAt = values.dateTime.toISOString();
            const description = values.description || "Scheduled Meeting";

            await call.getOrCreate({
                data: { starts_at: startsAt, custom: { description } },
            });

            setCallDetail(call);
            setMeetingState("isScheduleMeeting");
            toast({ title: "Meeting scheduled successfully" });

        } catch (error) {
            console.error("Meeting creation error:", error);
            toast({ title: "Failed to create meeting" });
        }
    };

    if (!client || !user) return <Loader />;

    const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

    return (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {/* ... HomeCard components (no changes needed) ... */}

            <MeetingModal
                isOpen={meetingState === 'isScheduleMeeting' && !callDetail} // Conditional rendering
                onClose={() => setMeetingState(undefined)}
                title="Create Meeting"
                handleClick={createMeeting}
                className="" // Added className
            >
                {/* ... children (no changes needed) ... */}
            </MeetingModal>

            <MeetingModal
                isOpen={meetingState === 'isScheduleMeeting' && callDetail} // Conditional rendering
                onClose={() => setMeetingState(undefined)}
                title="Meeting Created"
                handleClick={() => {
                    navigator.clipboard.writeText(meetingLink);
                    toast({ title: 'Link Copied' });
                }}
                image={'/icons/checked.svg'}
                buttonIcon="/icons/copy.svg"
                className="text-center" // Added className
                buttonText="Copy Meeting Link"
            />

            <MeetingModal
                isOpen={meetingState === 'isJoiningMeeting'}
                onClose={() => setMeetingState(undefined)}
                title="Type the link here"
                className="text-center" // Added className
                buttonText="Join Meeting"
                handleClick={() => router.push(values.link)}
            >
                {/* ... children (no changes needed) ... */}
            </MeetingModal>

            <MeetingModal
                isOpen={meetingState === 'isInstantMeeting'}
                onClose={() => setMeetingState(undefined)}
                title="Start an Instant Meeting"
                className="text-center"  // Added className
                buttonText="Start Meeting"
                handleClick={createMeeting}
            />
        </section>
    );
};

export default MeetingTypeList;