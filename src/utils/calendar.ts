export const addToCalendar = (event: {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
}) => {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const startDateStr = formatDate(event.startDate);
  const endDateStr = formatDate(event.endDate);

  // Create iCal format
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zapcom//Hacktoberfest 2025//EN',
    'BEGIN:VEVENT',
    `DTSTART:${startDateStr}`,
    `DTEND:${endDateStr}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  // Create a blob and download
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'hacktoberfest-2025.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const addToGoogleCalendar = (event: {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
}) => {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const startDateStr = formatDate(event.startDate);
  const endDateStr = formatDate(event.endDate);

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateStr}/${endDateStr}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

  window.open(googleCalendarUrl, '_blank');
};
