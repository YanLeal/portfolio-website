export interface ContactPhone {
  readonly display: string;
  readonly tel: string;
}

export interface ContactScheduleEntry {
  readonly label: string;
  readonly hours: string;
}

export interface SocialLinks {
  readonly instagram: string;
  readonly facebook: string;
}

export interface TimeSlots {
  readonly morning: readonly string[];
  readonly afternoon: readonly string[];
}
