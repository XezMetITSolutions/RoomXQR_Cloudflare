import GuestInterfaceClient from '@/app/guest/[roomId]/GuestInterfaceClient';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function GuestInterfaceDE({ params, searchParams }: { params: { roomId: string }; searchParams?: { guest?: string; g?: string; token?: string } }) {
    const guestName = searchParams?.guest ?? undefined;
    const guestToken = searchParams?.token ?? searchParams?.g ?? undefined;
    return (
        <NotificationProvider roomId={`room-${String(params.roomId).replace(/^(room-)+/i, '')}`}>
            <GuestInterfaceClient roomId={`room-${String(params.roomId).replace(/^(room-)+/i, '')}`} initialLang="de" guestName={guestName} guestToken={guestToken} />
        </NotificationProvider>
    );
}
