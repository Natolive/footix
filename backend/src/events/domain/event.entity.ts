export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startsAt: Date;
  durationMinutes: number;
  maxParticipants: number;
  paymentUrl: string | null;
  cancelledAt: Date | null;
  createdAt: Date;
}
