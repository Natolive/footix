export interface CalendarEvent {
  uid: string;
  title: string;
  description: string | null;
  location: string;
  startsAt: Date;
  endsAt: Date;
  url: string;
}
