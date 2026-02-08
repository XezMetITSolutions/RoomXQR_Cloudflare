import GuestInterfaceClient from '@/app/guest/[roomId]/GuestInterfaceClient';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function GuestInterfaceDE({ params }: { params: { roomId: string } }) {
    return (
        <NotificationProvider roomId={`room-${params.roomId}`}>
            <GuestInterfaceClient roomId={`room-${params.roomId}`} initialLang="de" />
        </NotificationProvider>
    );
}
