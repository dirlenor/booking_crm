import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api/response';
import { checkCanPublish, getTourById, publishTour, updateTour } from '@/lib/supabase/tours';
import { setPackagesStatusByDestination } from '@/lib/supabase/packages';
import type { TourStatus } from '@/types/database';

const VALID_STATUSES: TourStatus[] = ['draft', 'pending_review', 'published', 'archived', 'deleted'];

const VALID_TRANSITIONS: Record<TourStatus, TourStatus[]> = {
  draft: ['pending_review', 'published', 'archived', 'deleted'],
  pending_review: ['draft', 'published', 'archived', 'deleted'],
  published: ['archived', 'deleted'],
  archived: ['draft', 'deleted'],
  deleted: ['archived'],
};

interface StatusBody {
  status: TourStatus;
}

function mapTourStatusToPackageStatus(status: TourStatus): 'draft' | 'published' | 'archived' {
  if (status === 'published') return 'published';
  if (status === 'archived' || status === 'deleted') return 'archived';
  return 'draft';
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: StatusBody;

  try {
    body = (await request.json()) as StatusBody;
  } catch {
    return apiError('INVALID_JSON', 'Invalid request body', 400);
  }

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return apiError('VALIDATION_ERROR', 'Invalid status', 400, [
      { field: 'status', message: `Must be one of ${VALID_STATUSES.join(', ')}`, code: 'INVALID_ENUM' },
    ]);
  }

  const { data: current, error: getError } = await getTourById(id);
  if (getError) {
    return apiError('INTERNAL_ERROR', getError, 500);
  }
  if (!current) {
    return apiError('NOT_FOUND', 'Tour not found', 404);
  }

  const allowed = VALID_TRANSITIONS[current.status];
  if (!allowed.includes(body.status)) {
    return apiError('BUSINESS_RULE_VIOLATION', 'Invalid status transition', 422, [
      {
        field: 'status',
        message: `Cannot transition from ${current.status} to ${body.status}. Allowed: ${allowed.join(', ') || 'none'}`,
        code: 'INVALID_TRANSITION',
      },
    ]);
  }

  if (body.status === 'published') {
    const publishCheck = await checkCanPublish(id);
    if (!publishCheck.canPublish) {
      return apiError('BUSINESS_RULE_VIOLATION', 'Tour is not ready to publish', 422, publishCheck.missing.map((item) => ({
        field: 'publish',
        message: `Missing ${item}`,
        code: 'MISSING_REQUIREMENT',
      })));
    }

    const { data, error } = await publishTour(id);
    if (error) return apiError('INTERNAL_ERROR', error, 500);
    if (!data) return apiError('NOT_FOUND', 'Tour not found', 404);

    const syncRes = await setPackagesStatusByDestination(data.destination, mapTourStatusToPackageStatus(data.status));
    if (syncRes.error) return apiError('INTERNAL_ERROR', syncRes.error, 500);

    return apiSuccess(data);
  }

  const { data, error } = await updateTour(id, { status: body.status });
  if (error) return apiError('INTERNAL_ERROR', error, 500);
  if (!data) return apiError('NOT_FOUND', 'Tour not found', 404);

  const syncRes = await setPackagesStatusByDestination(data.destination, mapTourStatusToPackageStatus(data.status));
  if (syncRes.error) return apiError('INTERNAL_ERROR', syncRes.error, 500);

  return apiSuccess(data);
}
