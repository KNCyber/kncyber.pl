const uuid = require('uuid');

const CALENDAR_BASE = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
PRODID:dumbgenerator
X-WR-CALNAME:KNCyber
X-APPLE-CALENDAR-COLOR:#795AAB
REFRESH-INTERVAL;VALUE=DURATION:PT4H
X-PUBLISHED-TTL:PT4H
BEGIN:VTIMEZONE
TZID:Europe/Warsaw
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE
`

const generateEvent = (event) => {
    const twoWeeksBeforeEvent = event.start.minus({days: 14}).toUTC();
    const utcFormat = "yyyyMMdd'T'HHmmss'Z'";
    const localFormat = "yyyyMMdd'T'HHmmss";

    return `BEGIN:VEVENT
DTSTAMP:${twoWeeksBeforeEvent.toFormat(utcFormat)}
UID:${uuid.v4()}
DTSTART;TZID=Europe/Warsaw:${event.start.toFormat(localFormat)}
DTEND;TZID=Europe/Warsaw:${event.end.toFormat(localFormat)}
SUMMARY:${event.title}
LOCATION:${event.location}
DESCRIPTION:${event.description.replaceAll(/\n/g, '\\n')}
END:VEVENT
`
}

const generateICS = (events) => {
    let result = CALENDAR_BASE;
    for (const event of events) {
        result += generateEvent(event);
    }
    result += `END:VCALENDAR`;
    return result.replaceAll(/\n/g, '\r\n');
}

module.exports = {generateICS};
