import type { User } from '@/types'

export const mockUser: User = {
  id: 'user-1',
  name: 'Alex Silva',
  email: 'alex.silva@dev.com',
  image: 'https://github.com/shadcn.png',
  member: {
    id: 'member-1',
    organizationId: 'org-1',
    userId: 'user-1',
    role: 'admin',
    createdAt: new Date().toISOString(),
  }
}
