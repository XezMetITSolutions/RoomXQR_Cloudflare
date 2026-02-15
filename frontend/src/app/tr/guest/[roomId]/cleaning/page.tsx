import CleaningClient from '@/app/guest/[roomId]/CleaningClient';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function CleaningPageTR({ params }: { params: { roomId: string } }) {
    return (
        <NotificationProvider roomId={`room-${String(params.roomId).replace(/^(room-)+/i, '')}`}>
            <CleaningClient roomId={`room-${String(params.roomId).replace(/^(room-)+/i, '')}`} initialLang="tr" />
        </NotificationProvider>
    );
}
