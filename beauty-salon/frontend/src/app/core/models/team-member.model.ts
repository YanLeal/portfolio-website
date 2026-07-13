import type { TeamSocial } from '../interfaces/social.interface';

export interface TeamMember {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly photo?: string;
  readonly bio: string;
  readonly experience: string;
  readonly social: TeamSocial;
}
