import { describe, expect, test } from 'vitest';
import {
  eventSchema,
  eventUpdateSchema,
  sessionCreateSchema,
  sessionUpdateSchema,
  linkSpeakerSchema,
  questionSchema,
  speakerSchema,
  speakerUpdateSchema,
  roomSchema,
  signupSchema,
  validateBody,
} from '../lib/validators';

const createRequest = (body: object) =>
  new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('validators', () => {
  test('validateBody accepts a Request with valid event payload', async () => {
    const request = createRequest({
      title: 'AppConf',
      description: 'A conference for developers.',
      startDate: '2026-06-30',
      endDate: '2026-07-02',
      location: 'Austin',
    });

    const result = await validateBody(request, eventSchema);

    expect(result.data).toEqual({
      title: 'AppConf',
      description: 'A conference for developers.',
      startDate: '2026-06-30',
      endDate: '2026-07-02',
      location: 'Austin',
    });
    expect(result.error).toBeUndefined();
  });

  test('validateBody returns an error for invalid event payload', async () => {
    const request = createRequest({
      title: '',
      description: 'A conference for developers.',
      startDate: 'not-a-date',
      endDate: '2026-07-02',
      location: 'Austin',
    });

    const result = await validateBody(request, eventSchema);

    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  test('eventUpdateSchema allows partial updates', () => {
    const result = eventUpdateSchema.safeParse({
      description: 'Updated description.',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ description: 'Updated description.' });
  });

  test('sessionCreateSchema validates required fields', () => {
    const result = sessionCreateSchema.safeParse({
      title: 'Keynote',
      eventId: 'event-id',
      description: 'Deep dive into event planning.',
      startTime: '2026-06-30T10:00:00.000Z',
      endTime: '2026-06-30T11:00:00.000Z',
      roomId: 'room-id',
    });

    expect(result.success).toBe(true);
  });

  test('sessionUpdateSchema validates partial session updates', () => {
    const result = sessionUpdateSchema.safeParse({
      title: 'Updated Keynote',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ title: 'Updated Keynote' });
  });

  test('linkSpeakerSchema requires speakerId', () => {
    const result = linkSpeakerSchema.safeParse({ speakerId: 'speaker-1' });

    expect(result.success).toBe(true);
  });

  test('questionSchema validates question content', () => {
    const result = questionSchema.safeParse({
      content: 'Can we get a transcript?',
    });

    expect(result.success).toBe(true);
  });

  test('speakerSchema validates required speaker fields', () => {
    const result = speakerSchema.safeParse({
      fullName: 'Jane Doe',
      bio: 'Expert speaker on modern web practices.',
    });

    expect(result.success).toBe(true);
  });

  test('speakerUpdateSchema allows partial speaker updates', () => {
    const result = speakerUpdateSchema.safeParse({
      bio: 'Updated bio.',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ bio: 'Updated bio.' });
  });

  test('roomSchema validates room metadata optionality', () => {
    const result = roomSchema.safeParse({
      name: 'Room A',
    });

    expect(result.success).toBe(true);
  });

  test('signupSchema validates signup payload', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      name: 'User Tester',
      password: 'SecurePass123',
    });

    expect(result.success).toBe(true);
  });
});
