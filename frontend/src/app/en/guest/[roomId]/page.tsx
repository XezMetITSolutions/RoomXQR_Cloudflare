import GuestInterfaceClient from '@/app/guest/[roomId]/GuestInterfaceClient';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function GuestInterfaceEN({ params, searchParams }: { params: { roomId: string }; searchParams?: { guest?: string; g?: string } }) {
    const guestName = searchParams?.guest ?? undefined;
    const guestToken = searchParams?.g ?? undefined;
    return (
        <NotificationProvider roomId={`room-${String(params.roomId).replace(/^(room-)+/i, '')}`}>
            <GuestInterfaceClient roomId={`room-${String(params.roomId).replace(/^(room-)+/i, '')}`} initialLang="en" guestName={guestName} guestToken={guestToken} />
        </NotificationProvider>
    );
}
