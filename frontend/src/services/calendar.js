const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export async function signInWithGoogle() {
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: "622395128718-bqg11bjc6sm5ir2cfadpuiul66b5ipvm.apps.googleusercontent.com",
      scope: SCOPES,
      callback: (response) => {
        if (response.error) reject(response);
        else resolve(response.access_token);
      },
    });
    client.requestAccessToken();
  });
}

export function getScheduledTime(priority) {
  const now = new Date();
  const startTime = new Date(now);

  if (priority === 'high') {
    startTime.setDate(startTime.getDate() + 1);
    startTime.setHours(9, 0, 0, 0);
  } else if (priority === 'medium') {
    startTime.setDate(startTime.getDate() + 2);
    startTime.setHours(14, 0, 0, 0);
  } else {
    startTime.setDate(startTime.getDate() + 7);
    startTime.setHours(10, 0, 0, 0);
  }
  return startTime;
}

export async function pushTaskToCalendar(accessToken, task) {
  const startTime = getScheduledTime(task.priority);
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 1);

  const event = {
    summary: task.title,
    description: `${task.description || ''}\n\nAssignee: ${task.assignee || 'Unassigned'}\nPriority: ${task.priority?.toUpperCase()}\n\nCreated by Untangle AI`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    colorId: task.priority === 'high' ? '11' : task.priority === 'medium' ? '5' : '2',
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: 30 }],
    },
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to create calendar event');
  }

  return { ...(await response.json()), scheduledTime: startTime.toISOString() };
}