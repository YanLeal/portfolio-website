export interface TeamSocial {
  readonly instagram?: string;
  readonly facebook?: string;
  readonly whatsapp?: string;
}

export interface TeamMember {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly photo?: string;
  readonly bio: string;
  readonly experience: string;
  readonly social: TeamSocial;
}
