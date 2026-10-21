export function formatCountdownToBedtime(bedtimeTargetStr: string): {
  label: string;
  isPastBedtime: boolean;
  minutesRemaining: number;
} {
  const now = new Date();
  const [targetH, targetM] = bedtimeTargetStr.split(':').map(Number);
  
  const targetDate = new Date();
  targetDate.setHours(targetH || 23, targetM || 0, 0, 0);

  let diffMs = targetDate.getTime() - now.getTime();
  
  // If target already passed today by more than 4 hours, set to tomorrow
  if (diffMs < -4 * 60 * 60 * 1000) {
    targetDate.setDate(targetDate.getDate() + 1);
    diffMs = targetDate.getTime() - now.getTime();
  }

  const isPastBedtime = diffMs <= 0;
  const totalMinutes = Math.round(Math.abs(diffMs) / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (isPastBedtime) {
    return {
      label: `Bedtime reached (${hours > 0 ? `${hours}h ` : ''}${minutes}m ago)`,
      isPastBedtime: true,
      minutesRemaining: 0,
    };
  }

  return {
    label: `${hours > 0 ? `${hours}h ` : ''}${minutes}m until bedtime sweep`,
    isPastBedtime: false,
    minutesRemaining: totalMinutes,
  };
}

export function getCurrentTimeFormatted(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
