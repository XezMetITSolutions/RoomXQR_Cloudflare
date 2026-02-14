import GuestInterfaceClient from '@/app/guest/[roomId]/GuestInterfaceClient';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function GuestInterfaceTR({ params, searchParams }: { params: { roomId: string }; searchParams?: { guest?: string } }) {
    const guestName = searchParams?.guest ?? undefined;
    return (
        <NotificationProvider roomId={`room-${params.roomId}`}>
            <GuestInterfaceClient roomId={`room-${params.roomId}`} initialLang="tr" guestName={guestName} />
        </NotificationProvider>
    );
}
