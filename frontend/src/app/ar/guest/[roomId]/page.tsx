import GuestInterfaceClient from '@/app/guest/[roomId]/GuestInterfaceClient';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function GuestInterfaceAR({ params, searchParams }: { params: { roomId: string }; searchParams?: { guest?: string; g?: string; token?: string } }) {
    const guestName = searchParams?.guest ?? undefined;
    const guestToken = searchParams?.token ?? searchParams?.g ?? undefined;
    return (
        <NotificationProvider roomId={`room-${String(params.roomId).replace(/^(room-)+/i, '')}`}>
            <div dir="rtl">
                <GuestInterfaceClient roomId={`room-${String(params.roomId).replace(/^(room-)+/i, '')}`} initialLang="ar" guestName={guestName} guestToken={guestToken} />
            </div>
        </NotificationProvider>
    );
}
