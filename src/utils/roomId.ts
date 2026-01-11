import { nanoid } from 'nanoid';

export function generateRoomId(): string {
  return nanoid(21);
}

export function generatePeerId(): string {
  return nanoid(16);
}
